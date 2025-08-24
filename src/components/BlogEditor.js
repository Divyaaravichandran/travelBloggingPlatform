import React from "react";

function BlogEditor({
  title, setTitle,
  description, setDescription,
  content, setContent,
  tags, setTags,
  media, setMedia,
  coverImage, setCoverImage,
  onPublish, onSaveDraft
}) {
  return (
    <div>
      <input
        type="text"
        className="w-full mb-4 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 text-xl font-semibold transition"
        placeholder="Blog Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <textarea
        className="w-full mb-4 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 transition"
        rows={2}
        placeholder="Short Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <textarea
        className="w-full mb-4 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 transition"
        rows={8}
        placeholder="Write your blog content here..."
        value={content}
        onChange={e => setContent(e.target.value)}
      />
      {/* Tags, Media, Cover Image, etc. can be added here */}
      <div className="flex gap-4 mt-6">
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
          onClick={onPublish}
        >
          Publish
        </button>
        <button
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold shadow hover:bg-gray-300 transition"
          onClick={onSaveDraft}
        >
          Save Draft
        </button>
      </div>
    </div>
  );
}

export default BlogEditor;