package com.cwu.friendswithsigns

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.Toast
import androidx.fragment.app.Fragment
import com.cwu.friendswithsigns.databinding.ActivitySignInBinding
import com.google.firebase.Firebase
import com.google.firebase.auth.auth

class SignInFragment : Fragment() {
    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        try {
            var activityContext : MainActivity = requireActivity() as MainActivity
            if(activityContext.user != null) {
                parentFragmentManager.beginTransaction()
                    .replace(R.id.fragmentContainer, VideoFragment())
                    .commit() // Automatically handled, so no back stack
            } else {
                val view = ActivitySignInBinding.inflate(layoutInflater, container, false)

                val goToSignUpButton: Button = view.buttonGoToSignUp
                goToSignUpButton.setOnClickListener {
                    parentFragmentManager.beginTransaction()
                        .replace(R.id.fragmentContainer, SignUpFragment())
                        .addToBackStack(null)
                        .commit()
                }

                val signInButton: Button = view.buttonSignIn
                signInButton.setOnClickListener {
                    var user_email = view.inputEmail.text.toString()
                    var password = view.inputPassword.text.toString()
                    activityContext.auth.signInWithEmailAndPassword(user_email, password)
                        .addOnCompleteListener(requireActivity()) { task ->
                            if(task.isSuccessful) {
                                Log.d("SignInFragment", "User " + activityContext.auth.currentUser?.email + " logged in.")
                                // Update user ref globally
                                activityContext.user = activityContext.auth.currentUser
                                parentFragmentManager.beginTransaction()
                                    .replace(R.id.fragmentContainer, VideoFragment())
                                    .commit() // Automatically handled, so no back stack
                            } else {
                                view.inputEmail.text.clear();
                                view.inputPassword.text.clear();
                                Log.w("SignInFragment", "Login failed with user email: " + user_email)
                                Toast.makeText(
                                    activityContext,
                                    "Invalid username or password.",
                                    Toast.LENGTH_SHORT,
                                ).show()
                            }
                        }
                }
            }

            return view
        } catch (e: Exception) {
            Log.e("SignInFragment", "Error inflating view: ${e.message}", e)
            return null
        }
    }
}