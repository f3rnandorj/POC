import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  /// Kept from launch so the scene can hand them to React Native when it connects.
  var launchOptions: [UIApplication.LaunchOptionsKey: Any]?

  /// React Native is started by `SceneDelegate`, not here: iOS 26+ terminates at launch any app that
  /// has not adopted the UIScene lifecycle, and under scenes the window belongs to the scene rather
  /// than to the application. This method only builds the factory, once per process.
  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory
    self.launchOptions = launchOptions

    return true
  }
}

/**
 Owns the window and starts React Native into it.

 Declared in `Info.plist` under `UIApplicationSceneManifest` as `$(PRODUCT_MODULE_NAME).SceneDelegate`,
 and it lives in this file on purpose: a separate `SceneDelegate.swift` would have to be registered in
 the target's Sources build phase, which means editing `project.pbxproj` by hand for no gain.
 */
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene,
          let appDelegate = UIApplication.shared.delegate as? AppDelegate,
          let factory = appDelegate.reactNativeFactory
    else {
      return
    }

    let window = UIWindow(windowScene: windowScene)
    self.window = window

    // Sets the root view controller and calls `makeKeyAndVisible` itself.
    factory.startReactNative(
      withModuleName: "Fuego",
      in: window,
      launchOptions: appDelegate.launchOptions
    )
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
