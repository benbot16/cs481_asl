package com.cwu.friendswithsigns

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import androidx.fragment.app.Fragment
import com.google.firebase.Firebase
import com.google.firebase.auth.auth

class SignUpFragment : Fragment() {
    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        var auth = Firebase.auth
        var user = auth.currentUser
        if(user != null) {
            parentFragmentManager.beginTransaction()
                .replace(R.id.fragmentContainer, VideoFragment())
                .commit() // Automatically handled, so no back stack
        } else {
            val view = inflater.inflate(R.layout.activity_sign_up, container, false)
            val goToSignInButton: Button = view.findViewById(R.id.buttonGoToSignIn)
            goToSignInButton.setOnClickListener {
                parentFragmentManager.popBackStack()
            }
        }
        return view
    }
}
