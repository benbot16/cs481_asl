package com.cwu.friendswithsigns

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import androidx.fragment.app.Fragment

class SignInFragment : Fragment() {
    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        try {

            val view = inflater.inflate(R.layout.activity_sign_in, container, false)


            val goToSignUpButton: Button = view.findViewById(R.id.buttonGoToSignUp)
            goToSignUpButton.setOnClickListener {
                parentFragmentManager.beginTransaction()
                    .replace(R.id.fragmentContainer, SignUpFragment())
                    .addToBackStack(null)
                    .commit()
            }

            return view
        } catch (e: Exception) {
            Log.e("SignInFragment", "Error inflating view: ${e.message}", e)
            return null
        }
    }
}