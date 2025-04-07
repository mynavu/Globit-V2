import { supabase } from '../utils/supabaseClient.js'
import { totalStamps } from '../utils/totalStamps.js'

const mostPostedCountry = document.querySelector('.mostPostedCountry');
const mostPostedCountryImg = document.querySelector('.mostPostedCountryImg');
const mostPostedCountryData = document.querySelector('.mostPostedCountryData');

const postsNumber = document.querySelector('.postsNumber');
const stampsNumber = document.querySelector('.stampsNumber');
const countriesNumber = document.querySelector('.countriesNumber');

const suggestionImg = document.querySelector('.suggestionImg');
const suggestionCountry = document.querySelector('.country');
const suggestionCity = document.querySelectorAll('.city');
const suggestionStatement = document.querySelector('.suggestionStatement');
const mostPostedCountryStatement = document.querySelector('.mostPostedCountryStatement');

const imgDisplay = document.querySelector(".imgDisplay");
const descriptionDisplay = document.querySelector(".descriptionDisplay");
const locationDisplay = document.querySelector(".locationDisplay");
const mainbar2 = document.querySelector(".mainbar2");

const postReminder = document.querySelector(".postReminder");

document.addEventListener("DOMContentLoaded", async () => {

    const { data: { session }, error } = await supabase.auth.getSession();
    if (!session || error) {
        alert("You have to login")
        window.location.href = '../../index.html';
        return;
    }
    console.log("session.user",session.user)

    const { data: userData, error: dataError } = await supabase
    .from('users')
    .select()
    .eq('email', session.user.email)
    .single();
    console.log(`Welcome user: ${JSON.stringify(userData.username)}`)
    console.log(userData);
    const userID = userData.id;

    const usernameDisplay = document.getElementById('username1');
    usernameDisplay.innerText = `@${userData.username}`;

    //COUNTRIES
    const { data: countryList, error: countryListError } = await supabase
        .from('posts')
        .select('country')
        .eq('user_id', userID)
        .not('country', 'is', null);

    const countryFrequency = new Map();
    
    countryList.forEach(country => {
        country = country.country;
        if (countryFrequency.has(country)) {
            countryFrequency.set(country, countryFrequency.get(country) + 1)
        } else {
            countryFrequency.set(country, 1)
        }
    })

    console.log(countryFrequency);

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

    

    console.log("maxCount", maxCount, "maxCountry", maxCountry);
    
    //POSTS
    const { data: postList, error: postListError } = await supabase
        .from('posts')
        .select()
        .eq('user_id', userID)
        .order('post_created_at', { ascending: true });
    console.log("postList", postList);

    postsNumber.innerText = postList.length;

    if (postList.length > 0) {
        postList.forEach(post => {
            console.log("post", post);
            console.log(userData.username, post.location_name, post.image_url, post.caption);
            const HTMLString = `
                                <div class="post">
                                    <div class="profileDisplay">
                                        <img class="pfp2" src="../../assets/profile_pic.png">
                                        <div class="usernameAndLocation">
                                            <h4 class="username2">${userData.username}</h4>
                                            <h5 class="locationDisplay average">${post.location_name}</h5>
                                        </div>
                                    </div>
                                    <img class="imgDisplay" src="${post.image_url}">
                                    <h5 class="timeDisplay average">${post.post_created_at.slice(0, 10)}</h5>
                                    <h5 class="descriptionDisplay average">${post.caption}</h5>
                                </div>
                                `;
                                mainbar2.insertAdjacentHTML("beforeend", HTMLString);
        })

    } else {
        postReminder.style.display = "block";
    }


    //STAMPS
    const { data: stampList, error: stampListError } = await supabase
        .from('posts')
        .select('stamp')
        .eq('user_id', userID)
        .not('stamp', 'is', null);
        stampsNumber.innerText = stampList.length;
        const stampsLeft = totalStamps.filter((stamp) => (!stampList.includes(stamp.stamp)));
        const randomIndex = Math.floor(Math.random() * stampsLeft.length);
        const randomSuggestion = stampsLeft[randomIndex];
        suggestionCountry.innerText = randomSuggestion.country;
        suggestionCity.forEach((randomCity)=> (randomCity.innerText = randomSuggestion.city));
        const formattedCity = randomSuggestion.city.replaceAll(" ", "_");
        suggestionImg.src = `https://esrkdaokgokznnqzgwrg.supabase.co/storage/v1/object/public/stamp-images//${formattedCity}.PNG`;


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
const backgroundColor = document.querySelector(".background2");
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