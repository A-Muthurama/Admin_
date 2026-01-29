export const states = [
    "Maharashtra",
    "Karnataka",
    "Delhi",
    "Tamil Nadu",
    "Telangana",
    "Gujarat",
    "West Bengal",
    "Rajasthan"
];

export const citiesByState: { [key: string]: string[] } = {
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum"],
    "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Trichy"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner"]
};

export const pincodesByCity: { [key: string]: string[] } = {
    // Maharashtra
    "Mumbai": ["400001", "400002", "400050", "400099"],
    "Pune": ["411001", "411014", "411045", "411057"],
    "Nagpur": ["440001", "440010", "440022"],
    "Nashik": ["422001", "422003", "422010"],
    "Thane": ["400601", "400602", "400607"],

    // Karnataka
    "Bangalore": ["560001", "560003", "560004", "560029", "560095"],
    "Mysore": ["570001", "570010", "570020"],
    "Hubli": ["580001", "580020", "580030"],
    "Mangalore": ["575001", "575002", "575005"],
    "Belgaum": ["590001", "590002", "590003"],

    // Delhi
    "New Delhi": ["110001", "110002", "110005"],
    "North Delhi": ["110007", "110009", "110054"],
    "South Delhi": ["110017", "110019", "110049"],
    "East Delhi": ["110051", "110091", "110092"],
    "West Delhi": ["110015", "110018", "110058"],

    // Tamil Nadu
    "Chennai": ["600001", "600002", "600008", "600017"],
    "Coimbatore": ["641001", "641002", "641018"],
    "Madurai": ["625001", "625002", "625010"],
    "Salem": ["636001", "636002", "636004"],
    "Trichy": ["620001", "620002", "620005"],

    // Telangana
    "Hyderabad": ["500001", "500003", "500032", "500081"],
    "Warangal": ["506001", "506002", "506010"],
    "Nizamabad": ["503001", "503002", "503003"],
    "Karimnagar": ["505001", "505002"],
    "Khammam": ["507001", "507002"],

    // Gujarat
    "Ahmedabad": ["380001", "380004", "380015"],
    "Surat": ["395001", "395003", "395007"],
    "Vadodara": ["390001", "390007", "390010"],
    "Rajkot": ["360001", "360002", "360005"],
    "Bhavnagar": ["364001", "364002"],

    // West Bengal
    "Kolkata": ["700001", "700007", "700019", "700091"],
    "Howrah": ["711101", "711102", "711103"],
    "Durgapur": ["713201", "713203", "713210"],
    "Asansol": ["713301", "713302"],
    "Siliguri": ["734001", "734003", "734010"],

    // Rajasthan
    "Jaipur": ["302001", "302004", "302017"],
    "Jodhpur": ["342001", "342003", "342005"],
    "Udaipur": ["313001", "313002", "313004"],
    "Kota": ["324001", "324005", "324008"],
    "Bikaner": ["334001", "334003", "334004"]
};
