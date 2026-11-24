import os
import re
import json
import random
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini with your API key
api_key = os.getenv("GEMINI_API_KEY", "").strip()
if api_key:
    try:
        genai.configure(api_key=api_key)
    except Exception as e:
        print(f"⚠️ Gemini configure warning: {e}")

# Prioritized list of candidate models
CANDIDATE_MODELS = [
    "gemini-1.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro",
    "gemini-pro"
]

def get_available_model():
    """Find the best available model for generateContent."""
    try:
        models = [m.name for m in genai.list_models() if "generateContent" in m.supported_generation_methods]
        for candidate in CANDIDATE_MODELS:
            for m in models:
                if m == candidate or m == f"models/{candidate}":
                    return m
        if models:
            return models[0]
    except Exception:
        pass
    return CANDIDATE_MODELS[0]

# Curated landmark knowledge base for instant realistic itineraries
DESTINATION_KNOWLEDGE = {
    "paris": {
        "places": [
            ("Eiffel Tower & Champ de Mars", 2200),
            ("Louvre Museum & Glass Pyramid", 1800),
            ("Montmartre & Sacré-Cœur Basilica", 0),
            ("Musée d'Orsay Impressionist Gallery", 1500),
            ("Sainte-Chapelle & Notre-Dame Area", 1100),
            ("Arc de Triomphe & Champs-Élysées", 1200),
            ("Palace of Versailles Gardens", 2500),
            ("Seine River Cruise & Pont Neuf", 1400)
        ],
        "foods": [
            ("Fresh Butter Croissants & Café Crème", 450),
            ("Classic Beef Bourguignon", 1600),
            ("Artisan Macarons from Ladurée", 850),
            ("Crêpe Complète with Gruyère", 650),
            ("French Onion Soup Gratinée", 750)
        ],
        "activities": [
            "Sunset river cruise along the Seine admiring illuminated historic bridges.",
            "Strolling through cobbled alleys of the Latin Quarter discovering bohemian bookshops.",
            "Wine and artisanal cheese tasting session at an authentic Parisian cave.",
            "Exploring the bohemian painter's square in Place du Tertre."
        ]
    },
    "tokyo": {
        "places": [
            ("Senso-ji Temple & Nakamise Street", 0),
            ("Shibuya Crossing & Hachiko Statue", 0),
            ("Shinjuku Gyoen National Garden", 400),
            ("teamLab Planets Digital Art", 2800),
            ("Meiji Jingu Shrine & Harajuku", 0),
            ("Tokyo Skytree Observation Deck", 2200),
            ("Akihabara Electric Town", 0),
            ("Tsukiji Outer Seafood Market", 0)
        ],
        "foods": [
            ("Authentic Tonkotsu Ramen at Ichiran", 850),
            ("Chef's Selection Nigiri Sushi", 2200),
            ("Crispy Tempura Moriawase", 1200),
            ("Matcha Parfait & Dango", 600),
            ("Savory Okonomiyaki Street Pancake", 750)
        ],
        "activities": [
            "Watching the Shibuya scramble from a scenic cafe and exploring neon nightlife.",
            "Traditional tea ceremony experience in historic Asakusa gardens.",
            "Wandering through futuristic tech arcades and anime boutiques in Akihabara.",
            "Morning walk through the peaceful cypress groves of Meiji Jingu."
        ]
    },
    "kyoto": {
        "places": [
            ("Fushimi Inari Taisha 1,000 Torii Gates", 0),
            ("Kinkaku-ji (Golden Pavilion)", 500),
            ("Arashiyama Bamboo Grove & Monkey Park", 600),
            ("Gion Historic Geisha District", 0),
            ("Kiyomizu-dera Cliffside Temple", 450),
            ("Nijo Castle & Nightingale Floors", 850),
            ("Nishiki Food Market Alley", 0),
            ("Philosopher's Path Canal Walk", 0)
        ],
        "foods": [
            ("Artisanal Uji Matcha Soft Serve", 400),
            ("Traditional Kaiseki Multi-Course Lunch", 2800),
            ("Yudofu Simmered Tofu Hotpot", 1200),
            ("Fresh Soba Noodles with Dashi Broth", 850),
            ("Sweet Yatsuhashi Cinnamon Pastries", 350)
        ],
        "activities": [
            "Early morning hike through the thousands of vermilion torii gates at Fushimi Inari.",
            "Peaceful bamboo forest photography walk in Arashiyama as morning light filters through.",
            "Evening lantern-lit stroll through Gion hoping for glimpses of geiko and maiko.",
            "Sampling pickled treats and skewered seafood down the narrow Nishiki Market."
        ]
    },
    "bali": {
        "places": [
            ("Uluwatu Cliff Temple & Kecak Dance", 1200),
            ("Tegallalang Emerald Rice Terraces", 350),
            ("Sacred Monkey Forest Sanctuary", 600),
            ("Tanah Lot Sunset Rock Temple", 500),
            ("Campuhan Ridge Walk", 0),
            ("Tirta Empul Holy Water Spring", 400),
            ("Seminyak Beach & Beach Clubs", 0),
            ("Tegenungan Waterfall Canyon", 300)
        ],
        "foods": [
            ("Nasi Goreng with Chicken Satay", 450),
            ("Babi Guling Spiced Roast Plate", 750),
            ("Tropical Smoothie Bowl & Cold Coconut", 350),
            ("Fresh Grilled Jimbaran Seafood Platter", 1800),
            ("Bebek Betutu Slow-Cooked Duck", 950)
        ],
        "activities": [
            "Catching the golden sunset while listening to the hypnotic Kecak chant at Uluwatu.",
            "Morning yoga session surrounded by lush tropical jungle and river ravines.",
            "Snorkeling over vibrant coral reefs in crystal turquoise bays.",
            "Coffee tasting tour at a lush volcanic spice and Luwak plantation."
        ]
    },
    "goa": {
        "places": [
            ("Fort Aguada & Lighthouse Viewpoint", 100),
            ("Basilica of Bom Jesus Heritage", 0),
            ("Anjuna Beach & Flea Market", 0),
            ("Dudhsagar Cascading Falls Trek", 1500),
            ("Palolem Beach Crescent & Kayaking", 600),
            ("Fontainhas Latin Quarter Walk", 0),
            ("Chapora Fort & Vagator Coast", 50),
            ("Calangute Beach Watersports Hub", 1200)
        ],
        "foods": [
            ("Traditional Goan Fish Curry Thali", 350),
            ("Pork Vindaloo with Poi Bread", 450),
            ("Fresh Butter Garlic Prawns", 750),
            ("Warm Bebinca Layered Dessert", 250),
            ("Tender Coconut Sol Kadhi Cooler", 120)
        ],
        "activities": [
            "Watching vibrant sunsets from coastal cliffs followed by live acoustic beach shacks.",
            "Walking photography tour through colorful Portuguese villas in Fontainhas.",
            "Dolphin spotting speedboat excursion off the Arabian Sea coastline.",
            "Browsing vibrant evening flea markets for spices, textiles, and handmade jewelry."
        ]
    },
    "manali": {
        "places": [
            ("Solang Valley Adventure Arena", 800),
            ("Atal Tunnel & Sissu Waterfall", 500),
            ("Hadimba Ancient Wooden Temple", 100),
            ("Old Manali Bohemian Cafes", 0),
            ("Jogini Waterfalls Pine Forest Trek", 0),
            ("Vashisht Natural Sulphur Springs", 0),
            ("Rohtang Snow Crest Pass", 1500),
            ("Mall Road & Tibetan Monastery", 0)
        ],
        "foods": [
            ("Steaming Mountain Thukpa & Momos", 250),
            ("Himachali Siddu with Pure Ghee", 200),
            ("Fresh Tawa Fried Trout Fish", 650),
            ("Spiced Apple Cider & Apple Pie", 220),
            ("Hot Kulhad Chai with Pakoras", 100)
        ],
        "activities": [
            "Paragliding and ziplining soaring over snow-capped deodar forests in Solang.",
            "Scenic mountain drive through Atal Tunnel into pristine Lahaul Valley.",
            "Relaxing evening listening to indie live music at rustic wooden cafes in Old Manali.",
            "Gentle nature hike through pine fragrances to the thunderous Jogini Falls."
        ]
    },
    "jaipur": {
        "places": [
            ("Hawa Mahal (Palace of Winds)", 200),
            ("Amber Fort & Sheesh Mahal", 550),
            ("City Palace & Royal Courtyards", 700),
            ("Jantar Mantar Astronomical UNESCO Observatory", 200),
            ("Nahargarh Fort Sunset Viewpoint", 150),
            ("Jal Mahal Water Palace View", 0),
            ("Albert Hall Museum", 300),
            ("Bapu Bazaar Pink City Market", 0)
        ],
        "foods": [
            ("Authentic Dal Baati Churma Thali", 550),
            ("Crispy Pyaaz Kachori with Mint Chutney", 90),
            ("Rich Royal Laal Maas Curry", 750),
            ("Chilled Sweet Lassi in Earthen Kulhad", 120),
            ("Ghewar Sweet with Malai Topping", 250)
        ],
        "activities": [
            "Watching the pink stone facades of Hawa Mahal glow in early morning golden light.",
            "Exploring mirror-studded halls of Sheesh Mahal at grand Amber Fort.",
            "Sunset over the entire Pink City skyline from the ramparts of Nahargarh Fort.",
            "Shopping for gemstone jewelry, blue pottery, and bandhani textiles in traditional bazaars."
        ]
    },
    "santorini": {
        "places": [
            ("Oia Famous Blue Domes & Windmills", 0),
            ("Fira to Oia Caldera Cliff Walk", 0),
            ("Red Beach Volcanic Sands", 0),
            ("Ancient Akrotiri Minoan Ruins", 1200),
            ("Amoudi Bay & Cliff Jumping Harbor", 0),
            ("Imerovigli Highest Caldera Point", 0),
            ("Perissa Black Sand Beach", 0),
            ("Santo Wines Sunset Vineyard", 2200)
        ],
        "foods": [
            ("Fresh Grilled Calamari with Lemon", 1400),
            ("Greek Souvlaki with Tzatziki & Warm Pita", 450),
            ("Authentic Greek Salad with Feta Slab", 850),
            ("Crispy Tomato Keftedes Fritters", 600),
            ("Honey Baklava Pastry with Pistachios", 550)
        ],
        "activities": [
            "Securing an iconic sunset spot overlooking the whitewashed rooftops of Oia.",
            "Scenic sailing catamaran cruise around volcanic hot springs and hidden coves.",
            "Wine tasting crisp Assyrtiko white wines perched high on caldera cliffs.",
            "Swimming in deep volcanic waters at Red Beach and relaxing on black volcanic shores."
        ]
    },
    "rome": {
        "places": [
            ("Colosseum & Roman Forum", 2100),
            ("Vatican Museums & Sistine Chapel", 2400),
            ("Trevi Fountain & Spanish Steps", 0),
            ("Pantheon Ancient Dome", 450),
            ("Piazza Navona Baroque Fountains", 0),
            ("Trastevere Cobbled Quarter", 0),
            ("Villa Borghese Gardens & Gallery", 1300),
            ("Castel Sant'Angelo Riverside Fortress", 1200)
        ],
        "foods": [
            ("Creamy Authentic Spaghetti Carbonara", 1100),
            ("Crispy Roman Thin-Crust Pizza", 850),
            ("Artisan Pistachio Gelato", 350),
            ("Cacio e Pepe Hand-Rolled Pasta", 950),
            ("Espresso with Fresh Tiramisu", 550)
        ],
        "activities": [
            "Tossing a coin over your shoulder into the iconic waters of Trevi Fountain.",
            "Evening stroll through the lamp-lit, vine-draped piazzas of Trastevere.",
            "Exploring the grand arches of the Roman Forum imagining gladiatorial history.",
            "Tasting authentic wood-fired pinsa romana at a historic family trattoria."
        ]
    },
    "dubai": {
        "places": [
            ("Burj Khalifa At The Top 124th Floor", 3600),
            ("Dubai Mall & Fountain Spectacle", 0),
            ("Desert Safari with Dune Bashing", 2800),
            ("Dubai Marina Walk & Yacht Pier", 0),
            ("Miracle Garden Floral Displays", 1800),
            ("Old Dubai Gold & Spice Souks", 100),
            ("Museum of the Future", 3200),
            ("Atlantis Aquaventure Waterpark", 6500)
        ],
        "foods": [
            ("Fragrant Chicken Mandi Rice Feast", 750),
            ("Crispy Falafel & Hummus Mezze Platter", 450),
            ("Sweet Warm Kunafa with Cheese", 400),
            ("Emirati Camel Milk Gelato", 300),
            ("Shawarma with Garlic Toum & Pickles", 250)
        ],
        "activities": [
            "Golden hour dune bashing across red desert dunes followed by Bedouin dinner.",
            "Spectacular synchronized fountain dance show underneath Burj Khalifa.",
            "Traditional wooden Abra boat crossing across historic Dubai Creek.",
            "Luxury sunset catamaran cruise along Dubai Marina and Palm Jumeirah."
        ]
    },
    "london": {
        "places": [
            ("Big Ben & Houses of Parliament", 0),
            ("Tower of London & Crown Jewels", 3200),
            ("British Museum & Rosetta Stone", 0),
            ("Tower Bridge Glass Walkway", 1400),
            ("Buckingham Palace & Changing of Guards", 0),
            ("London Eye Giant Wheel", 3400),
            ("Westminster Abbey Royal Tombs", 2600),
            ("Borough Market Food Paradise", 0)
        ],
        "foods": [
            ("Traditional British Fish and Chips with Tartar", 1300),
            ("Sunday Roast Beef with Yorkshire Pudding", 1900),
            ("Afternoon High Tea with Warm Scones", 2200),
            ("Full English Breakfast with Cumberland Sausage", 1100),
            ("Warm Sticky Toffee Pudding with Custard", 650)
        ],
        "activities": [
            "Watching the historic Changing of the Guard outside Buckingham Palace gates.",
            "Sampling world gourmet cheeses, pies, and street foods across lively Borough Market.",
            "Scenic evening walk along the Thames South Bank past Shakespeare's Globe.",
            "Viewing royal history and diamond collections at the historic Tower of London."
        ]
    },
    "new york": {
        "places": [
            ("Statue of Liberty & Ellis Island", 2400),
            ("Central Park & Bethesda Fountain", 0),
            ("Empire State Building 86th Floor", 3800),
            ("Times Square Neon Spectacular", 0),
            ("Brooklyn Bridge Pedestrian Crossing", 0),
            ("The Metropolitan Museum of Art (Met)", 2500),
            ("High Line Elevated Urban Park", 0),
            ("Top of the Rock Observation Deck", 3600)
        ],
        "foods": [
            ("Classic NY Hand-Tossed Thin Pizza Slice", 350),
            ("Hot Salt Beef Pastrami Sandwich on Rye", 1600),
            ("Toasted Everything Bagel with Cream Cheese", 450),
            ("Creamy Authentic New York Cheesecake", 650),
            ("Street Cart Gourmet Pretzel & Hot Dog", 350)
        ],
        "activities": [
            "Sunset walk across the historic cables of Brooklyn Bridge toward Manhattan skyline.",
            "Biking through shaded leafy avenues and around the Jacqueline Onassis Reservoir in Central Park.",
            "Taking in panoramic 360-degree city views from the top of the Empire State Building.",
            "Broadway theater musical experience followed by vibrant late-night Times Square energy."
        ]
    },
    "singapore": {
        "places": [
            ("Gardens by the Bay & Supertree Observatory", 1800),
            ("Marina Bay Sands SkyPark Deck", 2200),
            ("Sentosa Island & Siloso Beach", 500),
            ("Singapore Botanic Gardens Orchid Walk", 350),
            ("Chinatown Heritage Centre & Buddha Tooth", 0),
            ("Little India & Sri Veeramakaliamman", 0),
            ("Jewel Changi Airport Rain Vortex", 0),
            ("Cloud Forest & Flower Dome", 2400)
        ],
        "foods": [
            ("Fragrant Hainanese Chicken Rice", 450),
            ("Signature Singapore Chili Crab with Buns", 2800),
            ("Spicy Coconut Laksa Noodle Soup", 550),
            ("Crispy Kaya Toast with Soft-Boiled Eggs", 350),
            ("Char Kway Teow Wok-Fried Noodles", 500)
        ],
        "activities": [
            "Evening Garden Rhapsody light and sound music show amidst the glowing Supertrees.",
            "Exploring hawker center culinary gems in Maxwell Food Centre and Chinatown.",
            "River cruise departing Clarke Quay observing heritage shophouses and skyscrapers.",
            "Walking through the mist-filled conservatory inside the world's tallest indoor waterfall at Cloud Forest."
        ]
    },
    "kashmir": {
        "places": [
            ("Dal Lake Iconic Shikara Ride", 800),
            ("Gulmarg World's Highest Gondola Phase 1 & 2", 1800),
            ("Pahalgam Betaab Valley & Aru Valley", 600),
            ("Shalimar Bagh & Nishat Mughal Gardens", 150),
            ("Sonmarg Golden Meadow Glacier Point", 1200),
            ("Shankaracharya Hilltop Shiva Temple", 0),
            ("Hazratbal Historic Lakeside Shrine", 0),
            ("Doodhpathri Valley of Milk Pine Meadows", 500)
        ],
        "foods": [
            ("Royal Kashmiri Rogan Josh with Steamed Rice", 650),
            ("Tender Mutton Gustaba in Yogurt Gravy", 700),
            ("Warm Saffron Kashmiri Kahwa Tea with Almonds", 150),
            ("Crispy Kashmiri Lavasa Bread with Chai", 100),
            ("Traditional 7-Course Wazwan Experience", 1400)
        ],
        "activities": [
            "Early sunrise Shikara paddle boat ride through floating lotus gardens and vegetable markets.",
            "Ascending above clouds via Gulmarg Gondola onto snowy peaks of Apharwat.",
            "Trekking on horseback along gushing mountain streams through pines in Pahalgam.",
            "Tasting aromatic saffron kahwa while resting on hand-woven carpets inside historic houseboats."
        ]
    },
    "swiss": {
        "places": [
            ("Matterhorn Glacier Paradise Zermatt", 7500),
            ("Jungfraujoch Top of Europe High Alpine", 9500),
            ("Lake Geneva & Chillon Medieval Castle", 1400),
            ("Lucerne Historic Chapel Bridge & Lion", 0),
            ("Interlaken Panorama & Harder Kulm", 2800),
            ("Grindelwald First Cliff Walk", 3200),
            ("Rhine Falls Europe's Largest Cascade", 800),
            ("Lauterbrunnen 72 Waterfalls Valley", 0)
        ],
        "foods": [
            ("Traditional Swiss Gruyère Cheese Fondue", 2400),
            ("Crispy Golden Swiss Rösti with Herbs", 1500),
            ("Authentic Swiss Milk Chocolate Tasting", 750),
            ("Zürcher Geschnetzeltes Veal in Cream Sauce", 2800),
            ("Warm Fresh Apple Strudel with Vanilla Sauce", 850)
        ],
        "activities": [
            "Cogwheel railway climb carving through alpine granite to the highest station in Europe at Jungfraujoch.",
            "Cable car ride offering heart-stopping perspectives of the pyramid peak of Matterhorn.",
            "Walking across the covered 14th-century wooden Chapel Bridge across Lake Lucerne.",
            "Hiking through Lauterbrunnen fairy-tale valley under sheer cliffs and thundering Staubbach Falls."
        ]
    },
    "ooty": {
        "places": [
            ("Nilgiri Mountain Toy Train Heritage Ride", 350),
            ("Government Botanical Gardens", 100),
            ("Ooty Lake Boating & Eucalyptus Forest", 300),
            ("Doddabetta Peak Highest Nilgiri Vantage", 50),
            ("Pykara Lake & Waterfalls Speedboat", 600),
            ("Rose Garden with 20,000 Varieties", 80),
            ("Tea Factory & Museum Tour", 150),
            ("Avalanche Lake Sanctuary", 250)
        ],
        "foods": [
            ("Freshly Made Ooty Dark Chocolate & Fudge", 350),
            ("Aromatic Steaming Nilgiri Tea with Cardamom", 50),
            ("Crispy South Indian Ghee Roast Dosa", 180),
            ("Hot Chettinad Spiced Curry Thali", 300),
            ("Traditional Baked Varkey Biscuits", 120)
        ],
        "activities": [
            "Scenic UNESCO steam engine toy train ride crossing deep viaducts and tea slopes.",
            "Paddle boating across misty waters of Ooty Lake surrounded by towering eucalyptus.",
            "Tea tasting directly at the factory learning the steps from leaf harvest to blend.",
            "Standing atop Doddabetta Peak looking over rolling blue mountains and cloud carpets."
        ]
    },
    "mysore": {
        "places": [
            ("Grand Mysore Palace & Illuminated Durbar Hall", 100),
            ("Chamundi Hill & Monolithic Nandi Bull Statue", 0),
            ("Brindavan Gardens & Musical Fountain", 50),
            ("St. Philomena's Neo-Gothic Cathedral", 0),
            ("Devaraja Century-Old Heritage Spice Market", 0),
            ("Ranganathittu Bird Sanctuary River Safari", 250),
            ("Jaganmohan Palace Art Gallery", 150),
            ("Karanji Lake & Giant Walk-Through Aviary", 80)
        ],
        "foods": [
            ("Authentic Warm Melt-in-Mouth Ghee Mysore Pak", 150),
            ("Crispy Golden Mysore Masala Dosa with Red Chutney", 120),
            ("Rich Fresh South Indian Filter Coffee", 40),
            ("Royal Mysore Thali with Bisi Bele Bath", 250),
            ("Mysore Bonda with Coconut Chutney", 80)
        ],
        "activities": [
            "Touring the opulent golden durbar and jewel-encrusted royal thrones inside Mysore Palace.",
            "Evening spectacle of 100,000 glowing bulbs illuminating Mysore Palace on weekends.",
            "Climbing scenic stone steps of Chamundi Hill greeted by panoramic views of the royal city.",
            "Walking through the colorful scents and vibrant mounds of flowers in Devaraja Market."
        ]
    },
    "mysuru": {
        "places": [
            ("Grand Mysore Palace & Illuminated Durbar Hall", 100),
            ("Chamundi Hill & Monolithic Nandi Bull Statue", 0),
            ("Brindavan Gardens & Musical Fountain", 50),
            ("St. Philomena's Neo-Gothic Cathedral", 0),
            ("Devaraja Century-Old Heritage Spice Market", 0),
            ("Ranganathittu Bird Sanctuary River Safari", 250)
        ],
        "foods": [
            ("Authentic Warm Melt-in-Mouth Ghee Mysore Pak", 150),
            ("Crispy Golden Mysore Masala Dosa with Red Chutney", 120),
            ("Rich Fresh South Indian Filter Coffee", 40),
            ("Royal Mysore Thali with Bisi Bele Bath", 250)
        ],
        "activities": [
            "Touring the opulent golden durbar and jewel-encrusted royal thrones inside Mysore Palace.",
            "Watching synchronized light and musical water fountain choreographies at Brindavan Gardens.",
            "Exploring the antique brass and sandalwood craft stores around Mysore's royal boulevard."
        ]
    },
    "coonoor": {
        "places": [
            ("Sim's Park Rare Botanical Collection", 50),
            ("Dolphin's Nose Dramatic Mountain Viewpoint", 20),
            ("Highfield Heritage Tea Factory & Plantation", 150),
            ("Lamb's Rock Sheer Precipice", 20),
            ("Catherine Waterfalls Scenic View", 0),
            ("Droog Fort Trekking Ridge", 0)
        ],
        "foods": [
            ("Warm Organic Nilgiri Green Tea", 60),
            ("Fresh Cinnamon Rolls & Nilgiri Scones", 180),
            ("South Indian Malabar Parotta with Veg Kurma", 160)
        ],
        "activities": [
            "Taking in views of Catherine Falls from Dolphin's Nose edge.",
            "Strolling under centuries-old imported conifers in Sim's Park.",
            "Tea processing walk and sampling estate-fresh Nilgiri black tea."
        ]
    }
}

def build_smart_fallback_itinerary(prompt: str) -> str:
    """
    Intelligent procedural generator that creates a realistic, mathematically sound
    day-wise itinerary if the live Gemini API key is expired or restricted.
    """
    # Extract destination
    dest_match = re.search(r"for\s+([^.\n]+)", prompt, re.IGNORECASE)
    raw_destination = dest_match.group(1).strip() if dest_match else "Dream Destination"
    
    # Check if nearby destinations are specified
    nearby_match = re.search(r"nearby destination\(s\):\s*([^\n.]+)", prompt, re.IGNORECASE)
    nearby_names = [n.strip() for n in nearby_match.group(1).split(",") if n.strip()] if nearby_match else []
    
    # Clean main destination name
    destination = re.sub(r"\s*and\s+nearby.*", "", raw_destination, flags=re.IGNORECASE).strip()

    # Extract duration
    dur_match = re.search(r"(\d+)[-\s]day", prompt, re.IGNORECASE)
    duration = int(dur_match.group(1)) if dur_match else 3
    duration = max(1, min(duration, 14)) # Keep between 1 and 14 days

    # Extract budget
    budget_match = re.search(r"budget\s*(?:is|:)?\s*₹?\s*(\d+)", prompt, re.IGNORECASE)
    budget = int(budget_match.group(1)) if budget_match else (duration * 5000)

    # Extract travel type
    type_match = re.search(r"type\s*(?:is|:)?\s*([^\n.,]+)", prompt, re.IGNORECASE)
    travel_type = type_match.group(1).strip() if type_match else "Solo"

    # Extract number of travelers
    travelers_match = re.search(r"travelers\s*(?:is|:)?\s*(\d+)", prompt, re.IGNORECASE)
    num_travelers = int(travelers_match.group(1)) if travelers_match else 1
    num_travelers = max(1, num_travelers)

    # Safety check for unrealistically low budget
    min_reasonable_budget = duration * num_travelers * 1200
    if budget < min_reasonable_budget:
        recommended = duration * num_travelers * 3000
        return json.dumps({
            "status": "invalid_request",
            "reason": f"A budget of ₹{budget:,} is insufficient for a {duration}-day journey with {num_travelers} traveler(s) to {destination}. It does not adequately cover essential travel transit, lodging, and daily meal expenses.",
            "minimum_recommended_budget": recommended,
            "suggestions": [
                f"Increase your investment to at least ₹{min_reasonable_budget:,} (minimum viable) or ₹{recommended:,} (recommended) to cover transit, stays, and meals.",
                f"Consider shortening your trip duration to {max(1, budget // (num_travelers * 1200))} days.",
                "Opt for regional transit and boutique homestays to optimize expenses."
            ]
        })

    # Helper to find or synthesize a profile
    def get_dest_profile(city_name):
        c_key = city_name.lower()
        for k in DESTINATION_KNOWLEDGE:
            if k in c_key or c_key in k:
                return DESTINATION_KNOWLEDGE[k]
        return {
            "places": [
                (f"{city_name} Historic Center & Landmark", 250),
                (f"{city_name} Scenic Viewpoint & Park", 100),
                (f"{city_name} Local Heritage Museum", 350),
                (f"{city_name} Artisan Craft & Cultural Market", 0),
                (f"{city_name} Lakeside / Riverside Walkway", 0),
                (f"{city_name} Famous Regional Temple / Shrine", 50)
            ],
            "foods": [
                (f"Authentic {city_name} Specialty Dish", 350),
                (f"Famous {city_name} Traditional Snack & Tea", 150),
                (f"Signature Local Chef's Meal", 650)
            ],
            "activities": [
                f"Guided walking tour around historic landmarks and bustling market lanes in {city_name}.",
                f"Sampling authentic regional delicacies and interacting with local artisans in {city_name}.",
                f"Catching sunset views and taking scenic photos across {city_name}."
            ]
        }

    primary_profile = get_dest_profile(destination)
    nearby_profiles = [get_dest_profile(n) for n in nearby_names]

    daily_budget = budget // duration
    stay_budget = int(daily_budget * 0.40)
    food_budget = int(daily_budget * 0.22)
    transport_budget = max(250, int(daily_budget * 0.18)) # Explicit daily travel/commute expense
    activities_budget = int(daily_budget * 0.12)
    misc_budget = max(0, daily_budget - (stay_budget + food_budget + transport_budget + activities_budget))

    time_slots = [
        "9:00 AM - 1:30 PM",
        "10:00 AM - 2:00 PM",
        "9:30 AM - 1:00 PM",
        "2:00 PM - 6:30 PM",
        "3:00 PM - 7:30 PM"
    ]
    interests_pool = ["Culture", "Sightseeing", "Food", "Relaxation", "Adventure", "Heritage"]

    itinerary_days = []
    total_calculated = 0

    # Distribute days across primary and nearby destinations if present
    # E.g. For a 4-day trip to Ooty with Mysuru: Days 1-2 in Ooty, Days 3-4 in Mysuru
    num_nearby = len(nearby_names)
    primary_days = max(1, duration // (num_nearby + 1)) if num_nearby > 0 else duration

    for day_num in range(1, duration + 1):
        if num_nearby > 0 and day_num > primary_days:
            # Nearby destination day
            nearby_idx = min(num_nearby - 1, (day_num - primary_days - 1))
            current_city = nearby_names[nearby_idx]
            current_profile = nearby_profiles[nearby_idx]
            is_transit_day = (day_num == primary_days + 1)
        else:
            current_city = destination
            current_profile = primary_profile
            is_transit_day = False

        places_pool = current_profile["places"]
        foods_pool = current_profile["foods"]
        activities_pool = current_profile["activities"]

        p1 = places_pool[(day_num * 2 - 2) % len(places_pool)]
        p2 = places_pool[(day_num * 2 - 1) % len(places_pool)]
        food = foods_pool[(day_num - 1) % len(foods_pool)]
        activity_desc = activities_pool[(day_num - 1) % len(activities_pool)]
        time_slot = time_slots[(day_num - 1) % len(time_slots)]
        interest = interests_pool[(day_num - 1) % len(interests_pool)]

        places_data = [
            {"place_name": p1[0], "entry_fee": p1[1]},
            {"place_name": p2[0], "entry_fee": p2[1]}
        ]

        day_total = stay_budget + food_budget + transport_budget + activities_budget + misc_budget
        total_calculated += day_total

        transit_prefix = f"Travel from {destination} to {current_city} with scenic valley transit stops. " if is_transit_day else ""

        itinerary_days.append({
            "day": day_num,
            "best_time": time_slot,
            "places": places_data,
            "special_food": {"food_name": food[0], "cost": food[1]},
            "activity": f"{transit_prefix}{activity_desc}",
            "interest": interest,
            "description": f"Day {day_num} in {current_city}: {transit_prefix}"
                           f"Explore {p1[0]} during the morning session, then take a culinary pause to savor {food[0]}. "
                           f"Spend your afternoon discovering {p2[0]} and enjoying the atmosphere of {current_city}.",
            "budget_breakdown": {
                "stay": stay_budget,
                "food": food_budget,
                "transport": transport_budget,
                "activities": activities_budget,
                "miscellaneous": misc_budget,
                "total_for_day": day_total
            }
        })

    return json.dumps(itinerary_days)

def generate_itinerary(prompt: str):
    """
    Attempts generation with Gemini.
    If Gemini fails due to 404, invalid key, or quota limits, seamlessly
    activates the smart fallback generator so the user experience is never blocked.
    """
    final_prompt = f"""
    You are a professional travel planner.

    STRICT RULES:
    - Return ONLY valid JSON
    - No explanation
    - No markdown formatting like ```json or ```
    - No conversational intro or outro text
    - DURATION: You MUST generate EXACTLY the number of days specified in the user's request.

    TASK:
    1. First, ANALYZE if the user's budget is realistic for the destination and duration.
    2. If the budget is NOT realistic:
      - Return INVALID_REQUEST JSON format only.
    3. If the budget IS realistic:
      - Generate a day-wise itinerary for ALL requested days.

    INVALID REQUEST JSON FORMAT:
    {{
      "status": "invalid_request",
      "reason": "Short explanation",
      "minimum_recommended_budget": number,
      "suggestions": [
        "Suggestion 1",
        "Suggestion 2"
      ]
    }}

    VALID ITINERARY FORMAT (ARRAY ONLY):
    [
      {{
        "day": 1,
        "best_time": "Time slot",
        "places": [
          {{ "place_name": "Name", "entry_fee": 500 }}
        ],
        "special_food": {{ "food_name": "Famous dish", "cost": 300 }},
        "activity": "Detailed activity description",
        "interest": "Category",
        "description": "Engaging day itinerary description",
        "budget_breakdown": {{
          "stay": 2000,
          "food": 800,
          "transport": 500,
          "activities": 400,
          "miscellaneous": 300,
          "total_for_day": 4000
        }}
      }}
    ]

    IMPORTANT:
    - Ensure EVERY requested day is present in the array.
    - Currency must match the user's budget (₹ INR)
    - Total budget MUST be respected.

    USER REQUEST:
    {prompt}
    """

    last_error = None
    primary_model = get_available_model()
    models_to_try = [primary_model] + [m for m in CANDIDATE_MODELS if m != primary_model and f"models/{m}" != primary_model]

    for model_name in models_to_try:
        try:
            print(f"🤖 Calling Gemini model: {model_name}...")
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(final_prompt)

            if not response or not response.candidates:
                continue

            try:
                text = response.text
                if text and len(text.strip()) > 0:
                    print(f"✅ Gemini successfully generated itinerary via {model_name}!")
                    return text
            except ValueError:
                continue
        except Exception as e:
            last_error = e
            print(f"⚠️ Gemini {model_name} error: {e}")
            continue

    # If Gemini could not generate (e.g. invalid key, 404, or network issue), use smart fallback generator
    print("ℹ️ Live Gemini API did not succeed (check GEMINI_API_KEY). Activating Smart Travel Planner fallback.")
    return build_smart_fallback_itinerary(prompt)
