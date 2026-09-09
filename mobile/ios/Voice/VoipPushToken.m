#import <React/RCTBridgeModule.h>
// generated Swift→ObjC header. this is how VoipCallManager and currentToken exist in this .m file.
#import "Voice-Swift.h"

@interface VoipPushToken : NSObject <RCTBridgeModule>
@end

@implementation VoipPushToken

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(getToken:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  resolve([VoipCallManager shared].currentToken);
}

@end
