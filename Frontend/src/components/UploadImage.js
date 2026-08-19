import React, { useState } from "react";

function UploadImage({ uploadImage, label, inputId }) {
  const [fileName, setFileName] = useState("");
  // Allow caller to pass a unique inputId; fall back to a stable default
  const id = inputId || "fileInput";

  const handleFileInputChange = (event) => {
    setFileName(event.target.files[0]);
    uploadImage(event.target.files[0]);
  };

  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
      <label
        htmlFor={id}
        className="inline-flex items-center rounded-md shadow-sm py-2 px-4 bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer w-fit"
      >
        <svg
          className="w-5 h-5 mr-2"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11 16V7.85l-2.6 2.6L7 9l5-5 5 5-1.4 1.45L13 7.85V16h-2zm-5 4q-.825 0-1.413-.588T4 18v-3h2v3h12v-3h2v3q0 .825-.588 1.413T18 20H6z"
            fill="currentColor"
          />
        </svg>
        <span className="truncate max-w-[200px]">
          {fileName?.name ? fileName.name : "Choose file"}
        </span>
      </label>
      <input
        type="file"
        id={id}
        className="hidden"
        accept=".png, .jpeg, .jpg"
        onChange={handleFileInputChange}
      />
    </div>
  );
}

export default UploadImage;
