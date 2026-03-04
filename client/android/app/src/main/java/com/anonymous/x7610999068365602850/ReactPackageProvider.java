package com.anonymous.x7610999068365602850;

import com.facebook.react.PackageList;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainPackageConfig;

import java.util.Arrays;
import java.util.List;

public class ReactPackageProvider {
    public static List<ReactPackage> getPackages(MainPackageConfig config) {
        List<ReactPackage> packages = new PackageList(config).getPackages();
        // 添加我们的自定义包
        packages.add(new NotificationListenerPackage());
        return packages;
    }
}
