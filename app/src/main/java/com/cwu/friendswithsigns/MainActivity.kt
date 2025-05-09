package com.cwu.friendswithsigns

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.view.View
import androidx.fragment.app.Fragment
import com.cwu.friendswithsigns.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {
    // Initialize view binding properly
    private lateinit var binding: ActivityMainBinding


    private val bottomNavVisibility = mapOf(

        SignInFragment::class.java.name to false,
        SignUpFragment::class.java.name to false,


        VideoFragment::class.java.name to true,
        HelpFragment::class.java.name to true


    )


    private val showBottomNavOnMainContent = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        try {

            binding = ActivityMainBinding.inflate(layoutInflater)
            setContentView(binding.root)


            binding.bottomNavigation.visibility = if (showBottomNavOnMainContent) View.VISIBLE else View.GONE


            binding.buttonStartSigning.setOnClickListener {
                showFragment(SignInFragment())
            }


            binding.buttonSigns.setOnClickListener {

            }

            binding.buttonHowTo.setOnClickListener {

            }


            binding.bottomNavigation.setOnItemSelectedListener { item ->
                val fragment = when (item.itemId) {
                    R.id.home -> {
                        VideoFragment()
                    }
                    R.id.help -> HelpFragment()
                    R.id.sign_out -> SignInFragment()
                    else -> null
                }

                fragment?.let {
                    showFragment(it)
                    true
                } ?: true
            }
        } catch (e: Exception) {
            Log.e("MainActivity", "Error during onCreate: ${e.message}", e)
            // Handle the error appropriately
        }
    }

    private fun showFragment(fragment: Fragment) {

        binding.mainContentLayout.visibility = View.GONE
        binding.fragmentContainer.visibility = View.VISIBLE


        updateBottomNavVisibility(fragment)


        supportFragmentManager.beginTransaction()
            .replace(R.id.fragmentContainer, fragment)
            .addToBackStack(fragment.javaClass.name)
            .commit()
    }

    private fun hideFragmentShowMainContent() {

        binding.mainContentLayout.visibility = View.VISIBLE
        binding.fragmentContainer.visibility = View.GONE


        binding.bottomNavigation.visibility = if (showBottomNavOnMainContent) View.VISIBLE else View.GONE
    }


    private fun updateBottomNavVisibility(fragment: Fragment) {
        val shouldShowNav = bottomNavVisibility[fragment.javaClass.name] ?: false
        binding.bottomNavigation.visibility = if (shouldShowNav) View.VISIBLE else View.GONE
    }

    override fun onBackPressed() {
        if (supportFragmentManager.backStackEntryCount > 0) {
            supportFragmentManager.popBackStack()


            if (supportFragmentManager.backStackEntryCount == 0) {
                hideFragmentShowMainContent()
            } else {
                // Get the current fragment to determine whether to show the bottom navigation
                updateBottomNavForCurrentFragment()
            }
        } else {
            super.onBackPressed()
        }
    }


    private fun updateBottomNavForCurrentFragment() {
        // Find the current fragment
        val currentFragment = supportFragmentManager.findFragmentById(R.id.fragmentContainer)

        currentFragment?.let {
            updateBottomNavVisibility(it)
        }
    }


    /**
     * A native method that is implemented by the 'friendswithsigns' native library,
     * which is packaged with this application.
     */
    external fun stringFromJNI(): String

    companion object {
        // Used to load the 'friendswithsigns' library on application startup.
        init {
            try {
                System.loadLibrary("friendswithsigns")
            } catch (e: UnsatisfiedLinkError) {
                Log.e("MainActivity", "Failed to load native library: ${e.message}", e)
                // Handle the native library loading failure
            }
        }
    }
}