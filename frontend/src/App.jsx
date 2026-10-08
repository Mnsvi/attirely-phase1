import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Category from "./pages/Category";
import ExploreMore from "./pages/ExploreMore";
import './App.css';

function App() {
  return (
    <>
      <Routes>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="category/:categoryName" element={<Category />} />
        <Route path="explore" element={<ExploreMore />} />
      </Routes>
    </>
  );
}

export default App;

