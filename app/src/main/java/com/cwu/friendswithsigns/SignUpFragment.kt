package com.cwu.friendswithsigns

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import com.cwu.friendswithsigns.databinding.ActivitySignUpBinding
import com.google.firebase.Firebase
import com.google.firebase.auth.auth

class SignUpFragment : Fragment() {
    val anRegex = Regex(pattern = "^[A-Za-z]+$", options = setOf(RegexOption.IGNORE_CASE))
    val numRegex = Regex(pattern = "^[0-9]+$", options = setOf(RegexOption.IGNORE_CASE))
    val emailRegex = Regex(pattern = "(?:[a-z0-9!#\$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#\$%&'*+/=?^_`{|}~-]+)*|\"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])", options = setOf(RegexOption.IGNORE_CASE))
    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        var activityContext : MainActivity = requireActivity() as MainActivity
        var auth = Firebase.auth
        var user = auth.currentUser
        if(user != null) {
            parentFragmentManager.beginTransaction()
                .replace(R.id.fragmentContainer, VideoFragment())
                .commit() // Automatically handled, so no back stack
        } else {
            val view = ActivitySignUpBinding.inflate(layoutInflater, container, false)
            val goToSignInButton = view.buttonGoToSignIn
            goToSignInButton.setOnClickListener {
                parentFragmentManager.popBackStack()
            }
            val signUpButton = view.buttonSignUp
            signUpButton.setOnClickListener {
                var error = false
                var fname = view.inputFirstName.text.toString()
                var lname = view.inputLastName.text.toString()
                var email = view.inputEmail.text.toString()
                var pass = view.inputPassword.toString()
                if(fname == "" || lname =="" || email == "" || pass == "") {
                    error = true
                    Toast.makeText(
                        activityContext,
                        "All inputs must contain text.",
                        Toast.LENGTH_SHORT,
                    ).show()
                }
                if(!fname.matches(anRegex) || !lname.matches(anRegex)) {
                    error = true
                    Toast.makeText(
                        activityContext,
                        "Your name cannot contain special characters or numbers.",
                        Toast.LENGTH_SHORT,
                    ).show()
                }
                if(!email.matches(emailRegex)) {
                    error = true
                    Toast.makeText(
                        activityContext,
                        "Email invalid.",
                        Toast.LENGTH_SHORT,
                    ).show()
                }
                if(!error) {
                    activityContext.auth.createUserWithEmailAndPassword(email, pass)
                        .addOnCompleteListener(requireActivity()) { task ->
                            if (task.isSuccessful) {
                                Log.d("SignUpFragment", "User $email logged in.")
                                // Update user ref globally
                                activityContext.user = activityContext.auth.currentUser
                                parentFragmentManager.beginTransaction()
                                    .replace(R.id.fragmentContainer, VideoFragment())
                                    .commit() // Automatically handled, so no back stack
                            } else {
                                view.inputEmail.text.clear()
                                view.inputPassword.text.clear()
                                Log.w("SignUpFragment", "Signup failed with user email: " + email)
                                Toast.makeText(
                                    activityContext,
                                    "Signup failed. Please check your connection.",
                                    Toast.LENGTH_SHORT,
                                ).show()
                            }
                        }
                }
            }
        }
        return view
    }
}
