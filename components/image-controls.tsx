"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ZoomIn, ZoomOut, RotateCcw, RotateCw, FlipHorizontal, FlipVertical, Contrast } from "lucide-react"

interface ImageControlsProps {
  zoom: number
  onZoomChange: (value: number) => void
  onRotateLeft?: () => void
  onRotateRight?: () => void
  onFlipHorizontal?: () => void
  onFlipVertical?: () => void
}

export default function ImageControls({
  zoom,
  onZoomChange,
  onRotateLeft,
  onRotateRight,
  onFlipHorizontal,
  onFlipVertical,
}: ImageControlsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => onZoomChange(Math.max(50, zoom - 10))}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Slider
          value={[zoom]}
          min={50}
          max={200}
          step={5}
          onValueChange={(value) => onZoomChange(value[0])}
          className="flex-1"
        />
        <Button variant="outline" size="icon" onClick={() => onZoomChange(Math.min(200, zoom + 10))}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium w-12 text-right">{zoom}%</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onRotateLeft && (
            <Button variant="outline" size="icon" onClick={onRotateLeft} title="Rotate Left">
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          {onRotateRight && (
            <Button variant="outline" size="icon" onClick={onRotateRight} title="Rotate Right">
              <RotateCw className="h-4 w-4" />
            </Button>
          )}
          {onFlipHorizontal && (
            <Button variant="outline" size="icon" onClick={onFlipHorizontal} title="Flip Horizontal">
              <FlipHorizontal className="h-4 w-4" />
            </Button>
          )}
          {onFlipVertical && (
            <Button variant="outline" size="icon" onClick={onFlipVertical} title="Flip Vertical">
              <FlipVertical className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Button variant="outline" size="sm">
          <Contrast className="h-4 w-4 mr-2" />
          Adjust
        </Button>
      </div>
    </div>
  )
}
