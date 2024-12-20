require('dotenv').config();
const VideoModal = require('../mongo-schema/video.schema');
const connectDB = require('../confgis/dbConfig');
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const BATCH_SIZE = 100;

// Helper function to generate random video titles
function getRandomTitle() {
    const titles = [
        "Epic Adventure",
        "The Rise of Phoenix",
        "Journey to the Unknown",
        "Mystery of the Night",
        "Uncharted Waters",
        "Breaking the Limits",
        "Edge of the Universe",
        "Shadow Realm",
        "King of the Jungle",
        "Galactic Invasion"
    ];
    return titles[Math.floor(Math.random() * titles.length)];
}

// Helper function to generate random thumbnail URLs
function getRandomThumbnail() {
    const thumbnails = [
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1522199710521-72d69614c702?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1521747116042-5a810fda9664?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1519337265831-281ec6cc8514?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1516542076529-1ea3854896b5?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1505678261036-a3fcc5e884ee?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1505196262516-1d9799372020?auto=format&fit=crop&w=500&q=80",
        "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=500&q=80"
    ];
    return thumbnails[Math.floor(Math.random() * thumbnails.length)];
}

// Helper function to generate random video descriptions
function getRandomDescription() {
    const descriptions = [
        "A thrilling adventure that will keep you on the edge of your seat.",
        "Discover the secrets behind the mysterious rise of the Phoenix.",
        "Take a journey through uncharted territories and explore the unknown.",
        "An enigmatic tale filled with twists and turns in the shadows of the night.",
        "Dive into the deep, uncharted waters where danger and discovery await.",
        "Pushing the limits of what's possible in this high-octane adventure.",
        "Explore the farthest edges of the universe in this cosmic exploration.",
        "A dark, shadowy realm where nothing is as it seems.",
        "The king of the jungle faces his greatest challenge yet.",
        "Prepare for an epic galactic invasion unlike any other."
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
}

(async () => {
    console.log('Script Started......');
    console.time();
    await connectDB();

    let arr = [];

    for (let i = 0; i < 100; i++) {
        arr.push({
            "title": getRandomTitle(),
            "thumbnail": getRandomThumbnail(),
            "path": "./uploads/videos/67612bfbe566af3f89c173e1",
            "uploadStatus": "COMPLETED",
            "isArchived": false,
            "views": 47,
            "likes": 0,
            "dislikes": 0,
            "description": getRandomDescription(),
            "userId": new ObjectId("67612bfbe566af3f89c173e1"),
            "createdBy": "Pratham",
        });

        if (arr.length === BATCH_SIZE) {
            await VideoModal.insertMany(arr);
            arr = [];
        }
    }

    if (arr.length > 0) {
        await VideoModal.insertMany(arr);
    }

    console.log('Script Ended......');
    console.timeEnd();
    process.exit(1);
})();
