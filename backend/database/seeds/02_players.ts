import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Delete existing entries
  await knex("players").del();
  
  // Insert players
  await knex("players").insert([
  {
    "name": "Aakash Agarwala",
    "gender": "male",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Aayush Kejriwal",
    "gender": "male",
    "category": "A-",
    "base_price": 30000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Aayush Killa",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Abhas Sultania",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Abhinav Arora",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Abhishek Muklania",
    "gender": "male",
    "category": "D",
    "base_price": 5000,
    "is_sold": false,
    "is_retained": true
  },
  {
    "name": "Abhishek Paul",
    "gender": "male",
    "category": "B-",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Abhra Ghosh",
    "gender": "male",
    "category": "A",
    "base_price": 30000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Adhyatma Prakash",
    "gender": "male",
    "category": "B-",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Aakash Kumar",
    "gender": "male",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": true
  },
  {
    "name": "Akash Mehta",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Alok  Patawari",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Amogh Agarwal",
    "gender": "male",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Anant Arora",
    "gender": "male",
    "category": "A",
    "base_price": 30000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Anshuman Damani",
    "gender": "male",
    "category": "C+",
    "base_price": 15000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Anubhav Gupta",
    "gender": "male",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": true
  },
  {
    "name": "Anudeep Jhunjhunwala",
    "gender": "male",
    "category": "B+",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Anup Killa",
    "gender": "male",
    "category": "C-",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Anurag Somani",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Anush Somani",
    "gender": "male",
    "category": "B-",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Apurv Chokhani",
    "gender": "male",
    "category": "D",
    "base_price": 5000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Archit Agarwal",
    "gender": "male",
    "category": "D",
    "base_price": 5000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Arjun Sahni",
    "gender": "male",
    "category": "B+",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Aroadra Agrawal",
    "gender": "male",
    "category": "C+",
    "base_price": 15000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Arup mullick",
    "gender": "male",
    "category": "B+",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Avinash kedia",
    "gender": "male",
    "category": "B-",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Ayush Damani",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Ayushman Padia",
    "gender": "male",
    "category": "B-",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Raghav todi",
    "gender": "male",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "BIDHAN CHAKRABORTY",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "bikash agarwal",
    "gender": "male",
    "category": "B-",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Bikram Ahuja",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Chirag Damani",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Deep Damani",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Devansh Khaitan",
    "gender": "male",
    "category": "C+",
    "base_price": 15000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Dhaval Sanghrajka",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Dhruv Dugar",
    "gender": "male",
    "category": "C-",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Dinkar Jeevani",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Gaurang Agarwala",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Gaurav Bajaj",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Gyayak shah",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Harsh Baid",
    "gender": "male",
    "category": "C+",
    "base_price": 15000,
    "is_sold": false,
    "is_retained": true
  },
  {
    "name": "Harsh Gurnani",
    "gender": "male",
    "category": "A",
    "base_price": 30000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Rohan Bhayani",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Harshman Saharia",
    "gender": "male",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Himanshu Fogla",
    "gender": "male",
    "category": "C-",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Jay bagri",
    "gender": "male",
    "category": "C+",
    "base_price": 15000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Kallis",
    "gender": "male",
    "category": "B+",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Kanishq Tibrewala",
    "gender": "male",
    "category": "C+",
    "base_price": 15000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Kaushal mehra",
    "gender": "male",
    "category": "B+",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Keshav Pachisia",
    "gender": "male",
    "category": "B+",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Ketan patel",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": true
  },
  {
    "name": "Krishiv patawari",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Kunal Mehta",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Samkit Chhajlani",
    "gender": "male",
    "category": "C+",
    "base_price": 15000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Lokesh",
    "gender": "male",
    "category": "D",
    "base_price": 5000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Manav Surana",
    "gender": "male",
    "category": "B+",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "MANDEEP JOHAR",
    "gender": "male",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Manish Sikri",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Moksh Desai",
    "gender": "male",
    "category": "C+",
    "base_price": 15000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Mudit Sarda",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Naman Patel",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Niraj Gandhi",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Neil patel",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Nikhil Tibrewal",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Nikunj Bahety",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "NIRAJ GOEL",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Nirmal Murarka",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Nishant Kripalani",
    "gender": "male",
    "category": "C+",
    "base_price": 15000,
    "is_sold": false,
    "is_retained": true
  },
  {
    "name": "Nishant Mookim",
    "gender": "male",
    "category": "D",
    "base_price": 5000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "P. Radhakrishanan",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Pankaj Maloo",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Kaushal Shah",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Parikshit Somani",
    "gender": "male",
    "category": "B-",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Pinak Singhania",
    "gender": "male",
    "category": "B-",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Samrat Ghosh",
    "gender": "male",
    "category": "A",
    "base_price": 30000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Praveen Chhajeer",
    "gender": "male",
    "category": "B-",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Pronojit Saha",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Raghav Gupta",
    "gender": "male",
    "category": "C+",
    "base_price": 15000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Raghav Gulati",
    "gender": "male",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Ram Bahtey",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Ratul Jain",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Rishabh Gupta",
    "gender": "male",
    "category": "A+",
    "base_price": 40000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Ronie Shah",
    "gender": "male",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Sagar Ahuja",
    "gender": "male",
    "category": "A-",
    "base_price": 30000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Sahil Choudhary",
    "gender": "male",
    "category": "C+",
    "base_price": 15000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "sahil jain",
    "gender": "male",
    "category": "C+",
    "base_price": 15000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Sahil Tahlani",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Saksham Madhogaria",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Sameek Bader",
    "gender": "male",
    "category": "D",
    "base_price": 5000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Sankalp KukAl",
    "gender": "male",
    "category": "B-",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Sarvesh Kedia",
    "gender": "male",
    "category": "C+",
    "base_price": 15000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Saurabh Baid",
    "gender": "male",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Scott Kang",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Shaurya Agarwal",
    "gender": "male",
    "category": "C+",
    "base_price": 15000,
    "is_sold": false,
    "is_retained": true
  },
  {
    "name": "Shaurya Sonthalia",
    "gender": "male",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Shlok Tibrewal",
    "gender": "male",
    "category": "D",
    "base_price": 5000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Shreevar Todi",
    "gender": "male",
    "category": "C-",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Shreyansh Daga",
    "gender": "male",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": true
  },
  {
    "name": "Shreyansh Shah",
    "gender": "male",
    "category": "C+",
    "base_price": 15000,
    "is_sold": false,
    "is_retained": true
  },
  {
    "name": "Siddharth Damani",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Sidhant Loiwal",
    "gender": "male",
    "category": "B-",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Somya Tibrewal",
    "gender": "male",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Surya Daga",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Swayam Pasari",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Swetik Sheth",
    "gender": "male",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Tanush Chandak",
    "gender": "male",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Tushar Khemani",
    "gender": "male",
    "category": "B+",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Tushar Rajgarhia",
    "gender": "male",
    "category": "C+",
    "base_price": 15000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Udit Todi",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "umang mehta",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Utsav Jain",
    "gender": "male",
    "category": "B-",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Vaibhav Saraf",
    "gender": "male",
    "category": "B-",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Varun Bagaria",
    "gender": "male",
    "category": "B-",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Vashisht Bhatia",
    "gender": "male",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Vatsal Pugalia",
    "gender": "male",
    "category": "C+",
    "base_price": 15000,
    "is_sold": false,
    "is_retained": true
  },
  {
    "name": "Vedant Khandelwal",
    "gender": "male",
    "category": "C+",
    "base_price": 15000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Vidyut Kauntia",
    "gender": "male",
    "category": "B-",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Vinay Goyal",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Vineet Goel",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Vishal Gupta",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Vishal Ladha",
    "gender": "male",
    "category": "D",
    "base_price": 5000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Vishal Tiwari",
    "gender": "male",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Vishesh Agarwal",
    "gender": "male",
    "category": "A-",
    "base_price": 30000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Yash Dhandhania",
    "gender": "male",
    "category": "B-",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Yash Dhanuka",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Yash Jalan",
    "gender": "male",
    "category": "A+",
    "base_price": 40000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Yashraj Poddar",
    "gender": "male",
    "category": "A-",
    "base_price": 30000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Yathaarth Mohta",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Yeshu Nahata",
    "gender": "male",
    "category": "B-",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Kishan Agarwal",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Rajat Chhabra",
    "gender": "male",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Neeraj Karla",
    "gender": "male",
    "category": "C+",
    "base_price": 15000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Rohit Karnawat",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Sidhaant Kandoi",
    "gender": "male",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Ricky nakhat",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Yashwant Kedia",
    "gender": "male",
    "category": "C-",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Abhay Jalan",
    "gender": "male",
    "category": "B-",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Aadarsh Choudhury",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Aayush Goel",
    "gender": "male",
    "category": "B-",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Abhishek Pansari",
    "gender": "male",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Abhishek Tibrewala",
    "gender": "male",
    "category": "B+",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Aditya Agarwal",
    "gender": "male",
    "category": "C+",
    "base_price": 15000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Arunava Majumdar",
    "gender": "male",
    "category": "A",
    "base_price": 30000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Ashish Agarwal",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Akshat Agarwal",
    "gender": "male",
    "category": "D",
    "base_price": 5000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Akshat Bhalotia",
    "gender": "male",
    "category": "B-",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Amit Nagrecha",
    "gender": "male",
    "category": "A-",
    "base_price": 30000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Saurabh Panja",
    "gender": "male",
    "category": "A",
    "base_price": 30000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Anurag Dalmia",
    "gender": "male",
    "category": "D",
    "base_price": 5000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Anurag Murarka",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Arjun Jindal",
    "gender": "male",
    "category": "D",
    "base_price": 5000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Aryan Ladsaria",
    "gender": "male",
    "category": "B-",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Atul Tekriwal",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Bhavya Kanoi",
    "gender": "male",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Daksh Gupta",
    "gender": "male",
    "category": "D",
    "base_price": 5000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Devansh Agarwal",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Devansh Chowdhury",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Devansh Mittal",
    "gender": "male",
    "category": "D",
    "base_price": 5000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Dhananjay Sureka",
    "gender": "male",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Gaurav Agarwal",
    "gender": "male",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Harsh Agarwal",
    "gender": "male",
    "category": "B-",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Harsh Vardhan Khaitan",
    "gender": "male",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Haydn Rodrigues",
    "gender": "male",
    "category": "D",
    "base_price": 5000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Ishan Goenka",
    "gender": "male",
    "category": "B-",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": true
  },
  {
    "name": "Jasmit Nagrecha",
    "gender": "male",
    "category": "B+",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Jatin Sainii",
    "gender": "male",
    "category": "A",
    "base_price": 30000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Justin Troung",
    "gender": "male",
    "category": "A-",
    "base_price": 30000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Aditya Pandey",
    "gender": "male",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Kanishk Gupta",
    "gender": "male",
    "category": "A",
    "base_price": 30000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Anirudh Agarwal",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Keshav",
    "gender": "male",
    "category": "D",
    "base_price": 5000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Keshav Saraf",
    "gender": "male",
    "category": "D",
    "base_price": 5000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Harsh Kandoi",
    "gender": "male",
    "category": "D",
    "base_price": 5000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Kshitij Kedia",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Manav Agarwal",
    "gender": "male",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Mayank Budhia",
    "gender": "male",
    "category": "C+",
    "base_price": 15000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Nikhil Bhambani",
    "gender": "male",
    "category": "B+",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": true
  },
  {
    "name": "Siddharth Nahata",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Pavneet Chabbra",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Piyush Choraria",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Pranav Jatia",
    "gender": "male",
    "category": "A",
    "base_price": 30000,
    "is_sold": false,
    "is_retained": true
  },
  {
    "name": "Prateek Lakhpatia",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Priyanshu Bajaj",
    "gender": "male",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": true
  },
  {
    "name": "Raghav Agarwal",
    "gender": "male",
    "category": "B-",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": true
  },
  {
    "name": "Raghav Gupta",
    "gender": "male",
    "category": "B-",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Rahil Sanghrajka",
    "gender": "male",
    "category": "A",
    "base_price": 30000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Rahul Jindal",
    "gender": "male",
    "category": "C-",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Rahul More",
    "gender": "male",
    "category": "C+",
    "base_price": 15000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Rahul Sirohia",
    "gender": "male",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Rahul Worah",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": true
  },
  {
    "name": "Rajat Choudhary",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Ritwik Jhunjhunwala",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Rohan Chitlangia",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Rohan Gupta",
    "gender": "male",
    "category": "B+",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Rohan Sofet",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Sachin Agarwala",
    "gender": "male",
    "category": "A",
    "base_price": 30000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Sahil Sangharajka",
    "gender": "male",
    "category": "B-",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Sailesh Arya",
    "gender": "male",
    "category": "B+",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": true
  },
  {
    "name": "Shantanu Todi",
    "gender": "male",
    "category": "A",
    "base_price": 30000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Sharad Nahata",
    "gender": "male",
    "category": "B+",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Sharaday Kasera",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Shivam Bansal",
    "gender": "male",
    "category": "B-",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Sudarshan Jagnani",
    "gender": "male",
    "category": "A+",
    "base_price": 40000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Aman Gunecha",
    "gender": "male",
    "category": "A+",
    "base_price": 40000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Tejas Gulati",
    "gender": "male",
    "category": "A+",
    "base_price": 40000,
    "is_sold": false,
    "is_retained": true
  },
  {
    "name": "Vaibhav Nahata",
    "gender": "male",
    "category": "C+",
    "base_price": 15000,
    "is_sold": false,
    "is_retained": true
  },
  {
    "name": "Varun Bhagat",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Varun Hansaria",
    "gender": "male",
    "category": "C+",
    "base_price": 15000,
    "is_sold": false,
    "is_retained": true
  },
  {
    "name": "Vidyush Dakalia",
    "gender": "male",
    "category": "B+",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": true
  },
  {
    "name": "Vinay Sethia",
    "gender": "male",
    "category": "A+",
    "base_price": 40000,
    "is_sold": false,
    "is_retained": true
  },
  {
    "name": "Vivek Bhimsaria",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Yash Tulsian",
    "gender": "male",
    "category": "B-",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Yashwanth Bothra",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Shashank Poddar",
    "gender": "male",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Raghav Todi",
    "gender": "male",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": true
  },
  {
    "name": "Aakriti Jhunjhunwala",
    "gender": "female",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Aanya Gujral",
    "gender": "female",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Aastha Seth",
    "gender": "female",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Ankita Dokania",
    "gender": "female",
    "category": "A",
    "base_price": 30000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Avnee khemka",
    "gender": "female",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Ayushi Damani",
    "gender": "female",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "DIPTI SRIVASTAVA",
    "gender": "female",
    "category": "A",
    "base_price": 30000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Disha Sikri",
    "gender": "female",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Harshika Seksaria",
    "gender": "female",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": true
  },
  {
    "name": "Isha Banthia",
    "gender": "female",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Kamakshi Agarwal",
    "gender": "female",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": true
  },
  {
    "name": "Khushboo Jain",
    "gender": "female",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Kinni Shah",
    "gender": "female",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Mihira Singh",
    "gender": "female",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Neeta jhunjhunwala",
    "gender": "female",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Neha Bhatnagar",
    "gender": "female",
    "category": "D",
    "base_price": 5000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Nikita Bader",
    "gender": "female",
    "category": "D",
    "base_price": 5000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "POOJA MEHRA",
    "gender": "female",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Priyanka Kasera",
    "gender": "female",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Priyanka Saklecha",
    "gender": "female",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Shivangni Madan",
    "gender": "female",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Shubhangi Jhunjhunwala",
    "gender": "female",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Srishti Bajaj",
    "gender": "female",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Tamanna Singhvi",
    "gender": "female",
    "category": "D",
    "base_price": 5000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Bhavana Nahata",
    "gender": "female",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Anshika Lakhmani",
    "gender": "female",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "MANSI SANGHVI BHAYANI",
    "gender": "female",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Sonal Chhabra",
    "gender": "female",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Nehal Killa",
    "gender": "female",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Alivia",
    "gender": "female",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Aarushi Jain",
    "gender": "female",
    "category": "A",
    "base_price": 30000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Ishika Gupta",
    "gender": "female",
    "category": "A",
    "base_price": 30000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Aditi Gupta",
    "gender": "female",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Niharika Bhagat",
    "gender": "female",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Aadya Arora",
    "gender": "female",
    "category": "D",
    "base_price": 5000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Nabila Sayed",
    "gender": "female",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Anisha Beria",
    "gender": "female",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Aditi Nahata",
    "gender": "female",
    "category": "A",
    "base_price": 30000,
    "is_sold": false,
    "is_retained": true
  },
  {
    "name": "Aditi Tibrewala",
    "gender": "female",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Amrita Mukherjee",
    "gender": "female",
    "category": "A",
    "base_price": 30000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Danielle Jones",
    "gender": "female",
    "category": "A",
    "base_price": 30000,
    "is_sold": false,
    "is_retained": true
  },
  {
    "name": "Devyani Bhagat",
    "gender": "female",
    "category": "C",
    "base_price": 10000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Natasha Jatia",
    "gender": "female",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Rachel Jones",
    "gender": "female",
    "category": "A",
    "base_price": 30000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Saachi Sirohia",
    "gender": "female",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Priyanka Sanganaria",
    "gender": "female",
    "category": "A",
    "base_price": 30000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Vasudha Nopany F",
    "gender": "female",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  },
  {
    "name": "Saba Ali Firoz",
    "gender": "female",
    "category": "B",
    "base_price": 20000,
    "is_sold": false,
    "is_retained": false
  }
]);
}