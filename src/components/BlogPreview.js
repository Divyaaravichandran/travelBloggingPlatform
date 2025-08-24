import React from "react";

function BlogPreview({ title, description, content, coverImage }) {
  return (
    <div className="bg-gray-100 rounded-xl p-6 shadow-inner min-h-[300px]">
      {coverImage && (
        <img src={coverImage} alt="Cover" className="w-full h-48 object-cover rounded-xl mb-4" />
      )}
      <h1 className="text-2xl font-bold mb-2">{title || "Blog Title"}</h1>
      <p className="text-gray-600 mb-4">{description || "Short description will appear here."}</p>
      <div className="prose prose-blue">{content || "Blog content preview..."}</div>
    </div>
  );
}

export default BlogPreview;