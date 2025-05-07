package com.cwu.friendswithsigns

import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import com.cwu.friendswithsigns.databinding.ActivitySignUpBinding

class SignUpFragment: Fragment(R.layout.fragment_sign_up) {
    private lateinit var binding: ActivitySignUpBinding

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        binding = ActivitySignUpBinding.inflate(layoutInflater)
    }
}