package shuunen.whatnow.app;

import android.os.Bundle;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		// Hide the system status bar for fullscreen
		if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.R) {
			final WindowInsetsController insetsController = getWindow().getInsetsController();
			if (insetsController != null) {
				insetsController.hide(WindowInsets.Type.statusBars());
				insetsController.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
			}
		} else {
			getWindow().setFlags(
				android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN,
				android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN
			);
		}
	}
}
