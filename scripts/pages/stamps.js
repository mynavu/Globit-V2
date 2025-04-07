import { supabase } from '../utils/supabaseClient.js'
import { matchList } from '../utils/matchList.js'
import { totalStamps } from '../utils/totalStamps.js'

const mostPostedCountry = document.querySelector('.mostPostedCountry');
const mostPostedCountryImg = document.querySelector('.mostPostedCountryImg');
const mostPostedCountryData = document.querySelector('.mostPostedCountryData');
const mostPostedCountryStatement = document.querySelector('.mostPostedCountryStatement');

const allStamps = document.querySelector('.allStamps');
const allCountries = document.querySelector('.allCountries');

const postsNumber = document.querySelector('.postsNumber');
const stampsNumber = document.querySelector('.stampsNumber');
const countriesNumber = document.querySelector('.countriesNumber');

const suggestionImg = document.querySelector('.suggestionImg');
const suggestionCountry = document.querySelector('.country');
const suggestionCity = document.querySelectorAll('.city');
const suggestionStatement = document.querySelector('.suggestionStatement');

const stampsReminder = document.querySelector('.stampsReminder');
const countriesReminder = document.querySelector('.countriesReminder');

const credits = document.querySelector(".credits");

document.addEventListener("DOMContentLoaded", async () => {

    const { data: { session }, error } = await supabase.auth.getSession();
    if (!session || error) {
        alert("You have to login")
        window.location.href = '../../index.html';
        return;
    }
    //console.log("session.user",session.user)

    const { data: userData, error: dataError } = await supabase
    .from('users')
    .select()
    .eq('email', session.user.email)
    .single();
    //console.log(`Welcome user: ${JSON.stringify(userData.username)}`)
    //console.log(userData);
    const userID = userData.id;

    const usernameDisplay = document.getElementById('username1');
    usernameDisplay.innerText = `@${userData.username}`;

    //COUNTRIES
    const { data: countryList, error: countryListError } = await supabase
        .from('posts')
        .select('country')
        .eq('user_id', userID)
        .not('country', 'is', null);
        //console.log("COUNTRY LIST", countryList);

        const countryFrequency = new Map();
    
    countryList.forEach(country => {
        country = country.country;
        if (countryFrequency.has(country)) {
            countryFrequency.set(country, countryFrequency.get(country) + 1)
        } else {
            countryFrequency.set(country, 1)
        }
    })

    let maxCount = 0;
    let maxCountry;
    for (const [country, count] of countryFrequency) {
        if (count > maxCount) {
            maxCount = count;
            maxCountry = country;
        }
    }
    if (maxCount > 0) {
        mostPostedCountry.innerHTML = maxCountry;
        const formattedCountry = maxCountry.replaceAll(' ', '_');
        if (formattedCountry === "Türkiye") {
            mostPostedCountryImg.src = "https://flagdownload.com/wp-content/uploads/Flag_of_Turkey_Flat_Round_Corner-1024x1024.png";
            } else if (formattedCountry === "People's_Republic_of_China") {
            mostPostedCountryImg.src = "https://flagdownload.com/wp-content/uploads/Flag_of_Peoples_Republic_of_China_Flat_Round_Corner-1024x1024.png";
            } else {
            mostPostedCountryImg.src = `https://flagdownload.com/wp-content/uploads/Flag_of_${formattedCountry}_Flat_Round_Corner-1024x1024.png`;
            };
        mostPostedCountryData.innerHTML = `You posted in ${maxCountry} ${maxCount} times!`

    } else {
        mostPostedCountryStatement.innerHTML = "";
        mostPostedCountryData.innerHTML = "Start posting to get a recap of your journey!"
    };
    
        if (countryFrequency.size > 0) {
            countriesReminder.style.display = "none";
            //console.log("countryFrequency",countryFrequency.size);
            countriesNumber.innerText = countryFrequency.size
            for (const [country, count] of countryFrequency) {
                const formattedCountry = country.replaceAll(' ', '_');
                if (formattedCountry === "Türkiye") {
                    const HTMLString = `<img src="https://flagdownload.com/wp-content/uploads/Flag_of_Turkey_Flat_Round_Corner-1024x1024.png">`;
                    allCountries.insertAdjacentHTML('beforeend', HTMLString);
                  } else if (formattedCountry === "People's_Republic_of_China") {
                    const HTMLString = `<img src="https://flagdownload.com/wp-content/uploads/Flag_of_Peoples_Republic_of_China_Flat_Round_Corner-1024x1024.png">`;
                    allCountries.insertAdjacentHTML('beforeend', HTMLString);
                  } else {
                    const HTMLString = `<img src="https://flagdownload.com/wp-content/uploads/Flag_of_${formattedCountry}_Flat_Round_Corner-1024x1024.png">`;
                    allCountries.insertAdjacentHTML('beforeend', HTMLString);
                  }
            }
        }
    //POSTS
    const { data: postList, error: postListError } = await supabase
        .from('posts')
        .select()
        .eq('user_id', userID);

    postsNumber.innerText = postList.length;


    //STAMPS
    const { data: stampList, error: stampListError } = await supabase
        .from('posts')
        .select('stamp')
        .eq('user_id', userID)
        .not('stamp', 'is', null);

    const stampValues = [...new Set(stampList.map(item => item.stamp))];
    //console.log("stampValues",stampValues);

    if (stampValues.length > 0) {
        credits.style.display = "block";
        stampsReminder.style.display = "none";
        stampsNumber.innerText = stampValues.length;
        stampValues.forEach((stamp) => {
            let formattedStamp = stamp.replaceAll(' ', '_');
            //console.log("formattedStamp", formattedStamp)
            const HTMLString = `<img src=https://esrkdaokgokznnqzgwrg.supabase.co/storage/v1/object/public/stamp-images/${formattedStamp}.PNG>`;
            allStamps.insertAdjacentHTML('beforeend', HTMLString);
          });
    }

    const stampsLeft = totalStamps.filter((stamp) => (!stampValues.includes(stamp.city)));
    //console.log("stampsLeft",stampsLeft);
        const randomIndex = Math.floor(Math.random() * stampsLeft.length);
        const randomSuggestion = stampsLeft[randomIndex];
        suggestionCountry.innerText = randomSuggestion.country;
        suggestionCity.forEach((randomCity)=> (randomCity.innerText = randomSuggestion.city));
        const formattedCity = randomSuggestion.city.replaceAll(" ", "_");
        suggestionImg.src = `https://esrkdaokgokznnqzgwrg.supabase.co/storage/v1/object/public/stamp-images/${formattedCity}.PNG`;

        const logOutButton = document.getElementById("logOutButton")
        logOutButton.addEventListener("click", async () => {
            const { error: logOutError } = await supabase.auth.signOut()
            if (logOutError) {
                alert("Theres an error: ", logOutError.message);
            } else {
                window.location.href = '../../index.html'
            }
        })


//DARK MODE LIGHT MODE

const settingsButton = document.querySelector('.menuSettings');
const customization = document.querySelector('.customization');

      settingsButton.addEventListener("click", () => {
          customization.style.display = (customization.style.display === "none" || customization.style.display === "") ? "flex" : "none";
      });

const mode = document.querySelector(".mode");
const modeButton = document.getElementById('check');
const backgroundColor = document.querySelector(".background");
const savedState = localStorage.getItem("checkboxState");

function darkMode() {
    localStorage.setItem('checkboxState', JSON.stringify(modeButton.checked));
    mode.innerText = "Mode: Dark";
    backgroundColor.style.background = "linear-gradient(black 20%, #07122e 50%)";
};

function lightMode() {
    localStorage.setItem('checkboxState', JSON.stringify(modeButton.checked));
    mode.innerText = "Mode: Light";
    backgroundColor.style.background = "linear-gradient(white 20%, var(--blue) 50%)";
}

if (savedState !== null) {
  modeButton.checked = JSON.parse(savedState);
};

modeButton.checked ? darkMode() : lightMode();

modeButton.addEventListener('change', () => {
    modeButton.checked ? darkMode() : lightMode();
});


});