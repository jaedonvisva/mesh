from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

# Initialize MongoDB connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client["Users"]
collection = db["Users"]

class User:
    def __init__(self, name, age=None, skills=None, experience=None, interests=None, background=None, tags=None):
        self.name = name
        self.age = age
        self.skills = skills
        self.experience = experience
        self.interests = interests
        self.background = background
        self.tags = tags

    def save(self):
        collection.insert_one(self.__dict__)

