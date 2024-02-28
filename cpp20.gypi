{
  "cflags_cc+": [ "-std=c++20" ],
  "xcode_settings": {
    "CLANG_CXX_LANGUAGE_STANDARD":"c++20",
    "OTHER_CPLUSPLUSFLAGS+": [ "-std=c++20" ]
  },
  "msbuild_settings": {
    "ClCompile": {
      "LanguageStandard": "stdcpp20",
      'AdditionalOptions': [ '/Zc:__cplusplus', ],
    }
  },
}
