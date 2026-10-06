package app.magnm.planner;

import android.content.ContentValues;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;
import androidx.core.content.FileProvider;
import com.getcapacitor.BridgeActivity;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Ensure status bar avoids overlapping and has dark icons on white background
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
            getWindow().setStatusBarColor(Color.WHITE);
        }

        // Expose native PDF handler bridge to WebView
        WebView webView = getBridge().getWebView();
        if (webView != null) {
            webView.addJavascriptInterface(new AndroidPdfBridge(), "AndroidBridge");
        }
    }

    public class AndroidPdfBridge {
        @JavascriptInterface
        public void saveAndOpenPdf(String base64Data, String filename) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        if (base64Data == null || base64Data.trim().isEmpty()) {
                            Toast.makeText(MainActivity.this, "PDF generation failed: empty data", Toast.LENGTH_SHORT).show();
                            return;
                        }

                        // Remove data URL prefix if present
                        String cleanBase64 = base64Data;
                        if (cleanBase64.contains(",")) {
                            cleanBase64 = cleanBase64.substring(cleanBase64.indexOf(",") + 1);
                        }
                        byte[] pdfBytes = Base64.decode(cleanBase64, Base64.DEFAULT);

                        String finalName = (filename != null && !filename.trim().isEmpty()) ? filename : "magnm-plan.pdf";
                        if (!finalName.endsWith(".pdf")) {
                            finalName += ".pdf";
                        }

                        // 1. Write to app cache folder for FileProvider
                        File cacheDocs = new File(getCacheDir(), "documents");
                        if (!cacheDocs.exists()) {
                            cacheDocs.mkdirs();
                        }
                        File pdfFile = new File(cacheDocs, finalName);
                        FileOutputStream fos = new FileOutputStream(pdfFile);
                        fos.write(pdfBytes);
                        fos.flush();
                        fos.close();

                        // 2. Also save to device Downloads folder on Android 10+
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                            try {
                                ContentValues values = new ContentValues();
                                values.put(MediaStore.MediaColumns.DISPLAY_NAME, finalName);
                                values.put(MediaStore.MediaColumns.MIME_TYPE, "application/pdf");
                                values.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
                                Uri downloadUri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                                if (downloadUri != null) {
                                    OutputStream out = getContentResolver().openOutputStream(downloadUri);
                                    if (out != null) {
                                        out.write(pdfBytes);
                                        out.flush();
                                        out.close();
                                    }
                                }
                            } catch (Exception ex) {
                                // Fallback to FileProvider only
                            }
                        }

                        // 3. Launch Chooser to view/print/share PDF
                        Uri contentUri = FileProvider.getUriForFile(
                            MainActivity.this,
                            getApplicationContext().getPackageName() + ".fileprovider",
                            pdfFile
                        );

                        Intent viewIntent = new Intent(Intent.ACTION_VIEW);
                        viewIntent.setDataAndType(contentUri, "application/pdf");
                        viewIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                        viewIntent.addFlags(Intent.FLAG_ACTIVITY_NO_HISTORY);

                        Intent chooser = Intent.createChooser(viewIntent, "Open PDF with...");
                        chooser.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                        startActivity(chooser);

                        Toast.makeText(MainActivity.this, "PDF saved to Downloads & opened", Toast.LENGTH_SHORT).show();
                    } catch (Exception e) {
                        Toast.makeText(MainActivity.this, "Could not open PDF: " + e.getMessage(), Toast.LENGTH_LONG).show();
                    }
                }
            });
        }
    }
}
