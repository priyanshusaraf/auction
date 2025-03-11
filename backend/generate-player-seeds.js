import fs from "fs";

const malePlayersRaw = `Sr. no.	MALES	CATEGORY
1	Aakash Agarwala	B
2	Aayush Kejriwal	A-
3	Aayush Killa	C
4	Abhas Sultania	C
5	Abhinav Arora	C
6	Abhishek Muklania	D
7	Abhishek Paul	B-
8	Abhra Ghosh	A
9	Adhyatma Prakash	B-
10	Aakash Kumar	B
11	Akash Mehta	C
12	Alok  Patawari	C
13	Amogh Agarwal	B
14	Anant Arora	A
15	Anshuman Damani	C+
16	Anubhav Gupta	B
17	Anudeep Jhunjhunwala	B+
18	Anup Killa 	C-
19	Anurag Somani	C
20	Anush Somani	B-
21	Apurv Chokhani	D
22	Archit Agarwal	D
23	Arjun Sahni	B+
24	Aroadra Agrawal	C+
25	Arup mullick	B+
26	Avinash kedia	B-
27	Ayush Damani	C
28	Ayushman Padia	B-
29	Raghav todi	B
30	BIDHAN CHAKRABORTY	C
31	bikash agarwal	B-
32	Bikram Ahuja	C
33	Chirag Damani	C
34	Deep Damani	C
35	Devansh Khaitan	C+
36	Dhaval Sanghrajka	C
37	Dhruv Dugar	C-
38	Dinkar Jeevani	C
39	Gaurang Agarwala	C
40	Gaurav Bajaj	C
41	Gyayak shah	C
42	Harsh Baid	C+
43	Harsh Gurnani	A
44	Rohan Bhayani	C
45	Harshman Saharia	B
46	Himanshu Fogla	C-
47	Jay bagri	C+
48	Kallis	B+
49	Kanishq Tibrewala	C+
50	Kaushal mehra	B+
51	Keshav Pachisia	B+
52	Ketan patel 	C
53	Krishiv patawari	C
54	Kunal Mehta	C
55	Samkit Chhajlani	C+
56	Lokesh	D
57	Manav Surana	B+
58	MANDEEP JOHAR	B
59	Manish Sikri	C
60	Moksh Desai	C+
61	Mudit Sarda	C
62	Naman Patel 	C
63	Niraj Gandhi	C
64	Neil patel	C
65	Nikhil Tibrewal	C
66	Nikunj Bahety	C
67	NIRAJ GOEL	C
68	Nirmal Murarka	C
69	Nishant Kripalani	C+
70	Nishant Mookim	D
71	P. Radhakrishanan	C
72	Pankaj Maloo	C
73	Kaushal Shah	C
74	Parikshit Somani	B-
75	Pinak Singhania	B-
76	Samrat Ghosh	A
77	Praveen Chhajeer	B-
78	Pronojit Saha	C
79	Raghav Gupta	C+
80	Raghav Gulati	B
81	Ram Bahtey	C
82	Ratul Jain	C
83	Rishabh Gupta	A+
84	Ronie Shah	B
85	Sagar Ahuja	A-
86	Sahil Choudhary	C+
87	sahil jain	C+
88	Sahil Tahlani	C
89	Saksham Madhogaria	C
90	Sameek Bader	D
91	Sankalp KukAl	B-
92	Sarvesh Kedia	C+
93	Saurabh Baid	B
94	Scott Kang	C
95	Shaurya Agarwal	C+
96	Shaurya Sonthalia	B
97	Shlok Tibrewal	D
98	Shreevar Todi	C-
99	Shreyansh Daga	B
100	Shreyansh Shah	C+
101	Siddharth Damani 	C
102	Sidhant Loiwal	B-
103	Somya Tibrewal	B
104	Surya Daga	C
105	Swayam Pasari	C
106	Swetik Sheth	B
107	Tanush Chandak	B
108	Tushar Khemani	B+
109	Tushar Rajgarhia	C+
110	Udit Todi	C
111	umang mehta	C
112	Utsav Jain	B-
113	Vaibhav Saraf	B-
114	Varun Bagaria	B-
115	Vashisht Bhatia	B
116	Vatsal Pugalia	C+
117	Vedant Khandelwal	C+
118	Vidyut Kauntia	B-
119	Vinay Goyal	C
120	Vineet Goel	C
121	Vishal Gupta	C
122	Vishal Ladha	D
123	Vishal Tiwari	B
124	Vishesh Agarwal	A-
125	Yash Dhandhania	B-
126	Yash Dhanuka	C
127	Yash Jalan	A+
128	Yashraj Poddar	A-
129	Yathaarth Mohta	C
130	Yeshu Nahata	B-
131	Kishan Agarwal	C
132	Rajat Chhabra	B
133	Neeraj Karla	C+
134	Rohit Karnawat	C
135	Sidhaant Kandoi	B
136	Ricky nakhat	C
137	Yashwant Kedia	C-
138	Abhay Jalan	B-
139	Aadarsh Choudhury	C
140	Aayush Goel	B-
141	Abhishek Pansari	B
142	Abhishek Tibrewala	B+
143	Aditya Agarwal	C+
144	Arunava Majumdar	A
145	Ashish Agarwal	C
146	Akshat Agarwal	D
147	Akshat Bhalotia	B-
148	Amit Nagrecha	A-
149	Saurabh Panja	A
150	Anurag Dalmia	D
151	Anurag Murarka	C
152	Arjun Jindal	D
153	Aryan Ladsaria	B-
154	Atul Tekriwal	C
155	Bhavya Kanoi	B
156	Daksh Gupta	D
157	Devansh Agarwal	C
158	Devansh Chowdhury	C
159	Devansh Mittal	D
160	Dhananjay Sureka	B
161	Gaurav Agarwal	B
162	Harsh Agarwal	B-
163	Harsh Vardhan Khaitan	B
164	Haydn Rodrigues	D
165	Ishan Goenka	B-
166	Jasmit Nagrecha	B+
167	Jatin Sainii	A
168	Justin Troung	A-
169	Aditya Pandey	B
170	Kanishk Gupta	A
171	Anirudh Agarwal	C
172	Keshav	D
173	Keshav Saraf	D
174	Harsh Kandoi	D
175	Kshitij Kedia	C
176	Manav Agarwal	B
177	Mayank Budhia	C+
178	Nikhil Bhambani	B+
179	Siddharth Nahata	C
180	Pavneet Chabbra	C
181	Piyush Choraria	C
182	Pranav Jatia	A
183	Prateek Lakhpatia	C
184	Priyanshu Bajaj	B
185	Raghav Agarwal	B-
186	Raghav Gupta	B-
187	Rahil Sanghrajka	A
188	Rahul Jindal	C-
189	Rahul More	C+
190	Rahul Sirohia	B
191	Rahul Worah	C
192	Rajat Choudhary	C
193	Ritwik Jhunjhunwala	C
194	Rohan Chitlangia	C
195	Rohan Gupta	B+
196	Rohan Sofet	C
197	Sachin Agarwala	A
198	Sahil Sangharajka	B-
199	Sailesh Arya	B+
200	Shantanu Todi	A
201	Sharad Nahata	B+
202	Sharaday Kasera	C
203	Shivam Bansal	B-
204	Sudarshan Jagnani	A+
205	Aman Gunecha	A+
206	Tejas Gulati	A+
207	Vaibhav Nahata	C+
208	Varun Bhagat	C
209	Varun Hansaria	C+
210	Vidyush Dakalia	B+
211	Vinay Sethia	A+
212	Vivek Bhimsaria	C
213	Yash Tulsian	B-
214	Yashwanth Bothra	C
215	Shashank Poddar	B
216	Raghav Todi	C`;

const femalePlayersRaw = `Sr.no	FEMALES	CATEGORY
1	Aakriti Jhunjhunwala	B
2	Aanya Gujral	C
3	Aastha Seth	B
4	Ankita Dokania	A
5	Avnee khemka	B
6	Ayushi Damani	C
7	DIPTI SRIVASTAVA	A
8	Disha Sikri	C
9	Harshika Seksaria	C
10	Isha Banthia	C
11	Kamakshi Agarwal	B
12	Khushboo Jain	C
13	Kinni Shah	B
14	Mihira Singh	C
15	Neeta jhunjhunwala	C
16	Neha Bhatnagar	D
17	Nikita Bader	D
18	POOJA MEHRA	B
19	Priyanka Kasera	C
20	Priyanka Saklecha	C
21	Shivangni Madan	B
22	Shubhangi Jhunjhunwala	B
23	Srishti Bajaj	B
24	Tamanna Singhvi	D
25	Bhavana Nahata	B
26	Anshika Lakhmani	B
27	MANSI SANGHVI BHAYANI	C
28	Sonal Chhabra	B
29	Nehal Killa	C
30	Alivia	C
31	Aarushi Jain	A
32	Ishika Gupta	A
33	Aditi Gupta	C
34	Niharika Bhagat	C
35	Aadya Arora	D
36	Nabila Sayed	B
37	Anisha Beria	C
38	Aditi Nahata	A
39	Aditi Tibrewala	B
40	Amrita Mukherjee	A
41	Danielle Jones	A
42	Devyani Bhagat	C
43	Natasha Jatia	B
44	Rachel Jones	A
45	Saachi Sirohia	B
46	Priyanka Sanganaria	A
47	Vasudha Nopany F	B
48	Saba Ali Firoz	B`;

// Function to parse player data
function parsePlayerData(rawData, gender) {
  const lines = rawData.trim().split("\n");
  // Skip the header line
  const playerLines = lines.slice(1);

  return playerLines
    .map((line) => {
      const parts = line.split("\t").map((part) => part.trim());
      if (parts.length >= 3) {
        const [_, name, category] = parts;
        let basePrice = 10000; // Default to C category price

        // Determine base price based on category
        if (category === "A+") basePrice = 40000;
        else if (category === "A" || category === "A-") basePrice = 30000;
        else if (category === "B+" || category === "B" || category === "B-")
          basePrice = 20000;
        else if (category === "C+")
          basePrice = 15000; // Adding C+ as a special case
        else if (category === "C" || category === "C-") basePrice = 10000;
        else if (category === "D") basePrice = 5000;

        return {
          name,
          gender,
          category,
          base_price: basePrice,
          is_sold: false,
          is_retained: false,
        };
      }
      return null;
    })
    .filter((player) => player !== null);
}

// Parse player data
const malePlayers = parsePlayerData(malePlayersRaw, "male");
const femalePlayers = parsePlayerData(femalePlayersRaw, "female");
const allPlayers = [...malePlayers, ...femalePlayers];

// Process retention data based on the retention list
const retentionList = [
  { team: "Pickle Brawlers", players: ["Shreyansh Daga", "Nishant Kripalani"] },
  { team: "Aurora", players: ["Abhishek Tibrewalla"] },
  { team: "Proflex Sports", players: [] },
  { team: "Serve-Ivors", players: ["Anubhav Gupta", "Harshika Seksaria"] },
  { team: "Net Warriors", players: [] },
  { team: "Ace King Smashers", players: ["Aakash Kumar", "Vidyush Dakalia"] },
  { team: "Pickle Pirates", players: ["Ketan patel"] },
  { team: "Lord of the Dinks", players: ["Aditi Nahata", "Vaibhav Nahata"] },
  { team: "Volley Vultures", players: ["Harsh Khaitan"] },
  { team: "The Panda Picklers", players: ["Ishan Goenka"] },
  { team: "House of Dinks", players: ["Shaurya Agarwal", "Kamakshi Agarwal"] },
  { team: "House of Dinkers", players: ["Samkit Jain"] },
  { team: "Space Jump Sharks", players: ["Nikhil Bhambani", "Rahul Worah"] },
  {
    team: "Your Smile Matters",
    players: ["Shreyansh Shah", "Abhishek Muklania"],
  },
  { team: "P Square Gladiators", players: ["Tejas Gulati", "Vatsal Pugalia"] },
  { team: "Spartans", players: ["Pranav Jatia", "Arup Mullick"] },
  { team: "Smokey Smashers", players: ["Priyanshu Bajaj", "Danielle Jones"] },
  { team: "Joy Game Changers", players: ["Raghav Agarwal"] },
  { team: "Heritage Jindal Picklers", players: ["Sailesh Arya"] },
  { team: "Smash", players: [] },
  { team: "PicklePotters", players: ["Varun Hansaria"] },
  { team: "One Love Champs", players: ["Vinay Sethia"] },
  { team: "Racquet Nation", players: ["Raghav Todi"] },
  { team: "JBG Settlers", players: ["Harsh Baid"] },
];

// Mark retained players
retentionList.forEach((team) => {
  team.players.forEach((playerName) => {
    const player = allPlayers.find((p) => p.name.trim() === playerName.trim());
    if (player) {
      player.is_retained = true;
    }
  });
});

// Generate the seed file content
const seedFileContent = `import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Delete existing entries
  await knex("players").del();
  
  // Insert players
  await knex("players").insert(${JSON.stringify(allPlayers, null, 2)});
}`;

// Write to file
fs.writeFileSync("database/seeds/02_players.ts", seedFileContent);
console.log("Player seed file generated successfully!");
