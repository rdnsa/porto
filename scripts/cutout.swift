// Lifts the subject out of a portrait photo using Apple's Vision framework.
// Usage: swift scripts/cutout.swift <input.jpg> <output.png> [combined|foreground|person]
// "combined" intersects the subject-lift and person-segmentation masks, then erodes the edge by
// a pixel so background colour (white window, green plants) does not fringe the silhouette.
import CoreImage
import CoreImage.CIFilterBuiltins
import Foundation
import ImageIO
import Vision

let args = CommandLine.arguments
guard args.count >= 3 else {
  print("usage: swift cutout.swift <input> <output.png> [combined|foreground|person]")
  exit(1)
}
let mode = args.count > 3 ? args[3] : "combined"

guard
  let source = CGImageSourceCreateWithURL(URL(fileURLWithPath: args[1]) as CFURL, nil),
  let cgImage = CGImageSourceCreateImageAtIndex(source, 0, nil)
else { fatalError("cannot read \(args[1])") }

let input = CIImage(cgImage: cgImage)
let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])

func personMask() throws -> CIImage {
  let request = VNGeneratePersonSegmentationRequest()
  request.qualityLevel = .accurate
  request.outputPixelFormat = kCVPixelFormatType_OneComponent8
  try handler.perform([request])
  guard let result = request.results?.first else { fatalError("no person found") }
  let raw = CIImage(cvPixelBuffer: result.pixelBuffer)
  return raw.transformed(
    by: CGAffineTransform(
      scaleX: input.extent.width / raw.extent.width,
      y: input.extent.height / raw.extent.height))
}

func foregroundMask() throws -> CIImage {
  let request = VNGenerateForegroundInstanceMaskRequest()
  try handler.perform([request])
  guard let result = request.results?.first else { fatalError("no subject found") }

  // Keep only the instance under the face (upper-centre of the frame), not plants or props.
  let labels = result.instanceMask
  CVPixelBufferLockBaseAddress(labels, .readOnly)
  let width = CVPixelBufferGetWidth(labels)
  let height = CVPixelBufferGetHeight(labels)
  let rowBytes = CVPixelBufferGetBytesPerRow(labels)
  let base = CVPixelBufferGetBaseAddress(labels)!.assumingMemoryBound(to: UInt8.self)
  let label = Int(base[Int(Double(height) * 0.40) * rowBytes + width / 2])
  CVPixelBufferUnlockBaseAddress(labels, .readOnly)

  let chosen: IndexSet = label > 0 ? IndexSet(integer: label) : result.allInstances
  return CIImage(cvPixelBuffer: try result.generateScaledMaskForImage(forInstances: chosen, from: handler))
}

var mask: CIImage
switch mode {
case "person": mask = try personMask()
case "foreground": mask = try foregroundMask()
default:
  let intersect = CIFilter.minimumCompositing()
  intersect.inputImage = try foregroundMask()
  intersect.backgroundImage = try personMask()
  let erode = CIFilter.morphologyMinimum()
  erode.inputImage = intersect.outputImage
  erode.radius = 1.5
  let soften = CIFilter.gaussianBlur()
  soften.inputImage = erode.outputImage?.clampedToExtent()
  soften.radius = 0.8
  mask = soften.outputImage!.cropped(to: input.extent)
}

let blend = CIFilter.blendWithMask()
blend.inputImage = input
blend.backgroundImage = CIImage(color: .clear).cropped(to: input.extent)
blend.maskImage = mask
guard let output = blend.outputImage?.cropped(to: input.extent) else { fatalError("blend failed") }

try CIContext().writePNGRepresentation(
  of: output, to: URL(fileURLWithPath: args[2]), format: .RGBA8,
  colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!)
print("wrote \(args[2]) (\(Int(input.extent.width))x\(Int(input.extent.height)), mode: \(mode))")
