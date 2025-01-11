from pymongo import MongoClient
from dotenv import load_dotenv
import os
load_dotenv()
client = MongoClient(os.getenv("MONGO_URI"))
db = client["Users"]
collection = db["Users"]

class User:
    def __init__(self, name, age, skills=None, experience=None, interests=None):
        self.name = name
        self.age = age
        self.skills = skills
        self.experience = experience
        self.interests = interests

    def save(self):
        collection.insert_one(self.__dict__)



user = User("John Does", 25, ["Python", "JavaScript"], 3, ["Reading", "Traveling"])
user.save()
