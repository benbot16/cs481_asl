package com.cwu.friendswithsigns

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.TextView
import androidx.navigation.fragment.NavHostFragment
import com.cwu.friendswithsigns.databinding.ActivityHelpBinding
import com.cwu.friendswithsigns.databinding.ActivityMainBinding
import com.cwu.friendswithsigns.databinding.ActivitySignInBinding
import com.cwu.friendswithsigns.databinding.ActivitySignUpBinding
import com.cwu.friendswithsigns.databinding.ActivityVideoBinding
import com.google.firebase.Firebase
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.auth

class MainActivity : AppCompatActivity() {

    private lateinit var mainBinding: ActivityMainBinding
    private lateinit var sign_binding: ActivitySignInBinding
    private lateinit var signup_binding: ActivitySignUpBinding
    private lateinit var video_binding: ActivityVideoBinding
    private lateinit var help_binding: ActivityHelpBinding
    private lateinit var auth: FirebaseAuth
    private lateinit var navHostFragment: NavHostFragment
    private val user_db = UserDatabase()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Init bindings
        mainBinding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(mainBinding.root)


        video_binding = ActivityVideoBinding.inflate(layoutInflater)
        help_binding = ActivityHelpBinding.inflate(layoutInflater)

        // Setup our authentication variable
        auth = Firebase.auth

        // Example of a call to a native method (commented for example)
        //binding.sampleText.text = stringFromJNI()
    }

    // Sign-in Stuff

    /**
     * A native method that is implemented by the 'friendswithsigns' native library,
     * which is packaged with this application.
     */
    external fun stringFromJNI(): String

    companion object {
        // Used to load the 'friendswithsigns' library on application startup.
        init {
            System.loadLibrary("friendswithsigns")
        }
    }
}