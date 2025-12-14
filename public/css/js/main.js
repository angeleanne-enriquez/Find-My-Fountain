import * as h from "../helpers.js";

(function($){
//all the variables for the register page 
let signupForm = $("#signup-form"), 
    firstName = $("#firstName"),
    lastName = $("#lastName"),
    email = $("#email"),
    username = $("#username"),
    password = $("#password"),
    confirmPassword = $("#confirmPassword"),
    bio = $("#bio"),
    picture = $("#picture"),
    privacy = $("#privacy"),
    error = $(".error"),
//all the variables for the login page incl the ones above 
    settingsForm = $("#settings-form"),
    updated = $(".updated")

if(signupForm.length){
    signupForm.on("submit", function(event) {
        event.preventDefault();

        //resets error label
        error.prop("hidden", true).text("");

        //checking inputs
        try{ 
            //firstName
            firstName.val(h.checkValidString(firstName.val(), 2, 20, "First name"));
            if(!/^[A-Za-z]+$/.test(firstName.val())) throw "Error: First name can only have letters."

            //lastName
            lastName.val(h.checkValidString(lastName.val(), 2, 20, "Last name"));
            if(!/^[A-Za-z]+$/.test(lastName.val())) throw "Error: Last name can only have letters."

            //email
            email.val(h.checkValidEmail(email.val(), "Email address"));

            //password + if matching
            password.val(h.checkValidPassword(password.val(), 8, null, "Password"));
            if(password.val() !== confirmPassword.val()) throw "Error: passwords must be matching";

            //username
            username.val(h.checkValidString(username.val(), 2, 20, "Username"));

            //bio
            if(bio.val().trim() !== "") bio.val(h.checkValidString(bio.val(), 20, 255, "Bio"));

            //privacy
            privacy.val(privacy.val().trim().toLowerCase());
            if(privacy.val() !== "private" && privacy.val() !== "public") throw "Error: privacy must only be 'private' or 'public'";

            //register the user if no errors have been thrown
            $.ajax({
                method: "POST",
                url: '/register',
                contentType: "application/json",
                data: JSON.stringify({
                    firstName: firstName.val(),
                    lastName: lastName.val(),
                    email: email.val(),
                    username: username.val(),
                    password: password.val(),
                    confirmPassword: confirmPassword.val(),
                    bio: bio.val(),
                    pic: picture.val(),
                    privacy: privacy.val()})
            }).then(function() {
                window.location.href = "/login";
            }).fail(function() {
                signupForm.trigger("reset");
                error.text("Failed to register user").prop("hidden", false);})            
        } catch(e) {
            signupForm.trigger("reset");
            error.text(e).prop("hidden", false);
        }

    })
}

if(settingsForm.length){
    settingsForm.on("submit", function(event) {
        event.preventDefault();

        //resets error and updated label
        error.prop("hidden", true).text("");
        updated.prop("hidden", true).text("");

        //checking inputs
        try{ 
            //firstName
            firstName.val(h.checkValidString(firstName.val(), 2, 20, "First name"));
            if(!/^[A-Za-z]+$/.test(firstName.val())) throw "Error: First name can only have letters."

            //lastName
            lastName.val(h.checkValidString(lastName.val(), 2, 20, "Last name"));
            if(!/^[A-Za-z]+$/.test(lastName.val())) throw "Error: Last name can only have letters."

            //email
            email.val(h.checkValidEmail(email.val(), "Email address"));

            //password + if matching
            password.val(h.checkValidPassword(password.val(), 8, null, "Password"));
            if(password.val() !== confirmPassword.val()) throw "Error: passwords must be matching";

            //username
            username.val(h.checkValidString(username.val(), 2, 20, "Username"));

            //bio
            if(bio.val().trim() !== "") bio.val(h.checkValidString(bio.val(), 20, 255, "Bio"));

            //privacy
            privacy.val(privacy.val().trim().toLowerCase());
            if(privacy.val() !== "private" && privacy.val() !== "public") throw "Error: privacy must only be 'private' or 'public'";

            //updates the settings if no errors have been thrown
            $.ajax({
                method: "POST",
                url: settingsForm.attr("action"),
                contentType: "application/json",
                data: JSON.stringify({
                    newFirst: firstName.val(),
                    newLast: lastName.val(),
                    newEmail: email.val(),
                    newUsername: username.val(),
                    newPassword: password.val(),
                    newConfirmPassword: confirmPassword.val(),
                    newBio: bio.val(),
                    newPic: picture.val(),
                    newPrivacy: privacy.val()})
            }).then(function() {
                updated.text("Updated settings.").prop("hidden", false);
                window.location.href = "/settings";
            }).fail(function() {
                settingsForm.trigger("reset");
                error.text("Failed to update user settings.").prop("hidden", false);})            
        } catch(e) {
            settingsForm.trigger("reset");
            error.text(e).prop("hidden", false);
        }
    })
}

})(window.jQuery);