import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    image: ""
  });

  const [itemForm, setItemForm] = useState({
    name: "",
    image: "",
    description: "",
    sound_url: "",
    categoryId: ""
  });

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, []);

  const fetchCategories = async () => {
    const res = await axios.get("http://localhost:5000/api/categories/list");
    setCategories(res.data.data);
  };

  const fetchItems = async () => {
    const res = await axios.get("http://localhost:5000/api/items/list");
    setItems(res.data.data);
  };

  const handleCategoryChange = (e) => {
    setCategoryForm({ ...categoryForm, [e.target.name]: e.target.value });
  };

  const handleItemChange = (e) => {
    setItemForm({ ...itemForm, [e.target.name]: e.target.value });
  };

  const createCategory = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5000/api/categories/create", categoryForm);
    setCategoryForm({ name: "", image: "" });
    fetchCategories();
  };

  const createItem = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5000/api/items/create", itemForm);
    setItemForm({ name: "", image: "", description: "", sound_url: "", categoryId: "" });
    fetchItems();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Category Form */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-semibold mb-3">Create Category</h2>
          <form onSubmit={createCategory} className="space-y-3">
            <input name="name" value={categoryForm.name} onChange={handleCategoryChange} placeholder="Category Name" className="w-full border p-2 rounded" />
            <input name="image" value={categoryForm.image} onChange={handleCategoryChange} placeholder="Image URL" className="w-full border p-2 rounded" />
            <button className="w-full bg-blue-500 text-white p-2 rounded">Add Category</button>
          </form>
        </div>

        {/* Item Form */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-semibold mb-3">Create Item</h2>
          <form onSubmit={createItem} className="space-y-3">
            <input name="name" value={itemForm.name} onChange={handleItemChange} placeholder="Item Name" className="w-full border p-2 rounded" />
            <input name="image" value={itemForm.image} onChange={handleItemChange} placeholder="Image URL" className="w-full border p-2 rounded" />
            <input name="sound_url" value={itemForm.sound_url} onChange={handleItemChange} placeholder="Sound URL" className="w-full border p-2 rounded" />
            <textarea name="description" value={itemForm.description} onChange={handleItemChange} placeholder="Description" className="w-full border p-2 rounded" />

            <select name="categoryId" value={itemForm.categoryId} onChange={handleItemChange} className="w-full border p-2 rounded">
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <button className="w-full bg-green-500 text-white p-2 rounded">Add Item</button>
          </form>
        </div>
      </div>

      {/* LIST SECTION */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Items List</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item._id} className="bg-white p-4 rounded-lg shadow">
              <img src={item.image} alt="" className="h-32 w-full object-cover rounded" />
              <h3 className="font-bold mt-2">{item.name}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
              <p className="text-xs text-gray-400 mt-1">{item.category?.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
