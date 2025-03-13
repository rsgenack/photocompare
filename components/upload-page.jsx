"use client"
import ImageUploader from "./image-uploader"

export default function UploadPage({ uploadedImages, handleImagesUploaded, handleImageDelete, startComparison }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="modern-card p-8 mb-12">
        <h1 className="text-3xl mb-8 text-center font-bold text-gray-800">Step 2: Upload Photos</h1>

        <div className="mb-12">
          <ImageUploader onImagesUploaded={handleImagesUploaded} />
        </div>

        {uploadedImages.length > 0 && (
          <div className="space-y-6">
            <div className="border-t border-b border-gray-200 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-700">Your Images ({uploadedImages.length})</h2>

              {uploadedImages.length < 2 ? (
                <div className="text-lg font-medium text-indigo-600">
                  Upload at least {2 - uploadedImages.length} more
                </div>
              ) : (
                <button onClick={startComparison} className="modern-button text-lg px-8 py-3">
                  Start Comparing
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {uploadedImages.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="rounded-lg overflow-hidden aspect-square shadow-sm border border-gray-200">
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt="Uploaded image"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-medium opacity-80 hover:opacity-100 transition-opacity"
                    onClick={() => handleImageDelete(image.id)}
                  >
                    X
                  </button>
                  <div className="truncate mt-1 text-sm text-gray-600">{image.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

