import { supabase } from '../utils/supabaseClient.js'

document.addEventListener('DOMContentLoaded', () => {

    const signUpForm = document.getElementById("signUpForm");

    signUpForm.addEventListener("submit", async(e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });
        
        if (authError) {
            alert('Sign-up error: ' + authError.message);
            return;
        } 
            alert('Check your email to confirm your account!');

            const { error: insertError } = await supabase
            .from('users')
            .insert({ username: username, email: email })
            if (insertError) {
                alert('Insert error: ' + insertError.message)
            } else {
                window.location.href = '../../index.html';
                
            }

        

    })
});


/*

const { data, error } = await supabase
  .from('users')
  .select()

console.log(data)
console.log(data[0].username)

*/

