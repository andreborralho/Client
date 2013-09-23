package com.festivall_new;

import android.os.Bundle;
import org.apache.cordova.DroidGap;

public class MainActivity extends DroidGap {

	private FestivallToaster toaster;
	
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState); 
		super.init();
	
		super.setIntegerProperty("splashscreen", R.drawable.splashscreen);
		
        toaster = new FestivallToaster(this, appView); 
        appView.addJavascriptInterface(toaster, "FestivallToaster"); 
		super.loadUrl("file:///android_asset/www/index.html", 8000);        
	}


//	@Override
//	public boolean onCreateOptionsMenu(Menu menu) {
//		// Inflate the menu; this adds items to the action bar if it is present.
//		getMenuInflater().inflate(R.menu.activity_main, menu);
//		return true;
//	}
	
}
