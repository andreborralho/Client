package com.festivall_new;

import android.webkit.WebView; 
import android.widget.Toast; 
import org.apache.cordova.DroidGap;

public class FestivallToaster{
	private WebView mAppView; 
	private DroidGap mGap; 

	public FestivallToaster(DroidGap gap, WebView view){ 
		mAppView = view; 
		mGap = gap; 
	} 

	public void showMessage(String message)	{ 
		Toast.makeText(mGap, message, Toast.LENGTH_LONG).show(); 
	} 

}
