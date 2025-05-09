package com.cwu.friendswithsigns

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import androidx.fragment.app.Fragment

class SignUpFragment : Fragment() {
    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.activity_sign_up, container, false)

        val goToSignInButton: Button = view.findViewById(R.id.buttonGoToSignIn)
        goToSignInButton.setOnClickListener {
            parentFragmentManager.popBackStack()
        }

        return view
    }
}
