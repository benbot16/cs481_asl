package com.cwu.friendswithsigns

import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import com.cwu.friendswithsigns.databinding.ActivitySignInBinding

class SignInFragment: Fragment(R.layout.activity_sign_in) {
    private lateinit var binding: ActivitySignInBinding

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        binding = ActivitySignInBinding.inflate(layoutInflater)
    }

}