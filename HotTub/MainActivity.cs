using System;
using Android.App;
using Android.Content;
using Android.Runtime;
using Android.Views;
using Android.Webkit;
using Android.Widget;
using Android.OS;

namespace MyHotTub
{
    [Activity(Label = "My Hot Tub", MainLauncher = true)]
    public class MainActivity : Activity
    {
        protected override void OnCreate(Bundle bundle)
        {
            base.OnCreate(bundle);

            // Set our view from the "main" layout resource
            SetContentView(Resource.Layout.Main);

            var webView = FindViewById<WebView>(Resource.Id.webView1);
            webView.SetWebViewClient(new WebViewClient());
            webView.Settings.JavaScriptEnabled = true;
            webView.LoadUrl("http://hottubweb.azurewebsites.net/");

        }

    }
}

