import { supabase } from '../utils/supabaseClient.js'
import { matchList } from '../utils/matchList.js'
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
        window.location.href = "index.html";
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

    //COUNTRIES
    const { data: countryList, error: countryListError } = await supabase
        .from('posts')
        .select('country')
        .eq('user_id', userID);

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

    console.log("maxCount", maxCount, "maxCountry", maxCountry);
    
    //POSTS
    const { data: postList, error: postListError } = await supabase
        .from('posts')
        .select()
        .eq('user_id', userID);
    console.log("postList", postList);

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
    /*
    const { data: stampList, error: stampListError } = await supabase
        .from('posts')
        .select('stamp')
        .eq('user_id', userID)
    */

});