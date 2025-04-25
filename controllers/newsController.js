const News = require('../models/NewsSchema');


exports.getAllNews = async (req, res) => { 
    try {
        const news = await News.find();
        res.status(200).json({
            message: "News fetched successfully",
            news: news
        });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching news", error: error.message });
    }
}

exports.createNews = async (req, res) => {
    try {
        const news = await News.create(req.body);
        return res.status(201).json({
            message: "News created successfully",
            news: news
        });
    } catch (err) {
        return res.status(500).json({ message: "Error creating news", error: err.message });
    }
}

exports.getNewsById = async (req, res) => {
    const { id } = req.params;
    const news = await News.findById(id);
    if (!news) { 
        return res.status(404).json({ message: "News not found" });
    }
    res.status(200).json({
        message: "News fetched successfully",
        news: news
    }); 
}

exports.updateNews = async (req, res) => {
    const { id } = req.params;
    const news = await News.findById(id);
    if (!news) {
        return res.status(404).json({ message: "News not found" });
    }
    await News.findByIdAndUpdate(id, req.body);
    res.status(200).json({ message: "News updated successfully" });
}

exports.deleteNews = async (req, res) => {
    const { id } = req.params;
    const news = await News.findById(id);
    if (!news) {
        return res.status(404).json({ message: "News not found" });
    }   
    await News.findByIdAndDelete(id);
    res.status(200).json({ message: "News deleted successfully" });
}





