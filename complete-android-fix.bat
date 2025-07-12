@echo off
echo ================================================
echo Complete Android Fix for React Native 0.80.x
echo ================================================
echo.

set ROOT_DIR=%cd%

:: Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: Run this from BrainBites root directory
    pause
    exit /b 1
)

echo Step 1: Clearing ALL Gradle caches...
echo ------------------------------------
echo This will clear corrupted Gradle metadata

:: Stop any running Gradle daemons
echo Stopping Gradle daemons...
call gradlew --stop 2>nul
timeout /t 3 /nobreak >nul

:: Clear Gradle caches completely
echo Clearing Gradle cache directory...
if exist "%USERPROFILE%\.gradle\caches" (
    rmdir /s /q "%USERPROFILE%\.gradle\caches" 2>nul
)
if exist "%USERPROFILE%\.gradle\daemon" (
    rmdir /s /q "%USERPROFILE%\.gradle\daemon" 2>nul
)
if exist "%USERPROFILE%\.gradle\wrapper" (
    rmdir /s /q "%USERPROFILE%\.gradle\wrapper" 2>nul
)

:: Clear local Android build folders
if exist "android\.gradle" rmdir /s /q "android\.gradle" 2>nul
if exist "android\build" rmdir /s /q "android\build" 2>nul
if exist "android\app\build" rmdir /s /q "android\app\build" 2>nul

echo.
echo Step 2: Creating Gradle wrapper files...
echo ---------------------------------------

:: Create gradle wrapper directory
if not exist "android\gradle\wrapper" mkdir "android\gradle\wrapper"

:: Create gradle-wrapper.properties for RN 0.80.x (uses Gradle 8.10.2)
(
echo distributionBase=GRADLE_USER_HOME
echo distributionPath=wrapper/dists
echo distributionUrl=https\://services.gradle.org/distributions/gradle-8.10.2-all.zip
echo networkTimeout=10000
echo validateDistributionUrl=true
echo zipStoreBase=GRADLE_USER_HOME
echo zipStorePath=wrapper/dists
) > "android\gradle\wrapper\gradle-wrapper.properties"

:: Create gradlew.bat
(
echo @rem
echo @rem Copyright 2015 the original author or authors.
echo @rem
echo @rem Licensed under the Apache License, Version 2.0 ^(the "License"^);
echo @rem you may not use this file except in compliance with the License.
echo @rem You may obtain a copy of the License at
echo @rem
echo @rem      https://www.apache.org/licenses/LICENSE-2.0
echo @rem
echo @rem Unless required by applicable law or agreed to in writing, software
echo @rem distributed under the License is distributed on an "AS IS" BASIS,
echo @rem WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
echo @rem See the License for the specific language governing permissions and
echo @rem limitations under the License.
echo @rem
echo.
echo @if "%%DEBUG%%"=="" @echo off
echo @rem ##########################################################################
echo @rem
echo @rem  Gradle startup script for Windows
echo @rem
echo @rem ##########################################################################
echo.
echo @rem Set local scope for the variables with windows NT shell
echo if "%%OS%%"=="Windows_NT" setlocal
echo.
echo set DIRNAME=%%~dp0
echo if "%%DIRNAME%%"=="" set DIRNAME=.
echo @rem This is normally unused
echo set APP_BASE_NAME=%%~n0
echo set APP_HOME=%%DIRNAME%%
echo.
echo @rem Add default JVM options here. You can also use JAVA_OPTS and GRADLE_OPTS to pass JVM options to this script.
echo set DEFAULT_JVM_OPTS="-Xmx64m" "-Xms64m"
echo.
echo @rem Find java.exe
echo if defined JAVA_HOME goto findJavaFromJavaHome
echo.
echo set JAVA_EXE=java.exe
echo %%JAVA_EXE%% -version ^>NUL 2^>^&1
echo if %%errorlevel%%==0 goto execute
echo.
echo echo ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
echo echo.
echo echo Please set the JAVA_HOME variable in your environment to match the
echo echo location of your Java installation.
echo.
echo goto fail
echo.
echo :findJavaFromJavaHome
echo set JAVA_HOME=%%JAVA_HOME:"=%%
echo set JAVA_EXE=%%JAVA_HOME%%/bin/java.exe
echo.
echo if exist "%%JAVA_EXE%%" goto execute
echo.
echo echo ERROR: JAVA_HOME is set to an invalid directory: %%JAVA_HOME%%
echo echo.
echo echo Please set the JAVA_HOME variable in your environment to match the
echo echo location of your Java installation.
echo.
echo goto fail
echo.
echo :execute
echo @rem Setup the command line
echo.
echo set CLASSPATH=%%APP_HOME%%\gradle\wrapper\gradle-wrapper.jar
echo.
echo @rem Execute Gradle
echo "%%JAVA_EXE%%" %%DEFAULT_JVM_OPTS%% %%JAVA_OPTS%% %%GRADLE_OPTS%% "-Dorg.gradle.appname=%%APP_BASE_NAME%%" -classpath "%%CLASSPATH%%" org.gradle.wrapper.GradleWrapperMain %%*
echo.
echo :end
echo @rem End local scope for the variables with windows NT shell
echo if "%%ERRORLEVEL%%"=="0" goto mainEnd
echo.
echo :fail
echo rem Set variable GRADLE_EXIT_CONSOLE if you need the _script_ return code instead of
echo rem the _cmd.exe /c_ return code!
echo if not "%%GRADLE_EXIT_CONSOLE%%"=="" exit 1
echo exit /b 1
echo.
echo :mainEnd
echo if "%%OS%%"=="Windows_NT" endlocal
echo.
echo :omega
) > "android\gradlew.bat"

:: Create gradlew (Unix version)
(
echo #!/bin/sh
echo.
echo #
echo # Copyright © 2015-2021 the original authors.
echo #
echo # Licensed under the Apache License, Version 2.0 ^(the "License"^);
echo # you may not use this file except in compliance with the License.
echo # You may obtain a copy of the License at
echo #
echo #      https://www.apache.org/licenses/LICENSE-2.0
echo #
echo # Unless required by applicable law or agreed to in writing, software
echo # distributed under the License is distributed on an "AS IS" BASIS,
echo # WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
echo # See the License for the specific language governing permissions and
echo # limitations under the License.
echo #
echo.
echo ##############################################################################
echo #
echo #   Gradle start up script for POSIX generated by Gradle.
echo #
echo #   Important for running:
echo #
echo #   ^(1^) You need a POSIX-compliant shell to run this script. If your /bin/sh is
echo #       noncompliant, but you have some other compliant shell such as ksh or
echo #       bash, then to run this script, type that shell name before the whole
echo #       command line, like:
echo #
echo #           ksh Gradle
echo #
echo #       Busybox and similar reduced shells will NOT work, because this script
echo #       requires all of these POSIX shell features:
echo #         * functions;
echo #         * expansions «$var», «${var}», «${var:-default}», «${var+SET}»,
echo #           «${var#prefix}», «${var%%suffix}», and «$( cmd )»;
echo #         * compound commands having a testable exit status, especially «case»;
echo #         * various built-in commands including «command», «set», and «ulimit».
echo #
echo #   Important for patching:
echo #
echo #   ^(2^) This script targets any POSIX shell, so it avoids extensions provided
echo #       by Bash, Ksh, etc; in particular arrays are avoided.
echo #
echo #       The "traditional" practice of packing multiple parameters into a
echo #       space-separated string is a well documented source of bugs and security
echo #       problems, so this is ^(mostly^) avoided, by progressively accumulating
echo #       options in "$@", and eventually passing that to Java.
echo #
echo #       Where the inherited environment variables ^(DEFAULT_JVM_OPTS, JAVA_OPTS,
echo #       and GRADLE_OPTS^) rely on word-splitting, this is performed explicitly;
echo #       see the in-line comments for details.
echo #
echo #       There are tweaks for specific operating systems such as AIX, CygWin,
echo #       Darwin, MinGW, and NonStop.
echo #
echo #   ^(3^) This script is generated from the Groovy template
echo #       https://github.com/gradle/gradle/blob/HEAD/subprojects/plugins/src/main/resources/org/gradle/api/internal/plugins/unixStartScript.txt
echo #       within the Gradle project.
echo #
echo #       You can find Gradle at https://github.com/gradle/gradle/.
echo #
echo ##############################################################################
echo.
echo # Attempt to set APP_HOME
echo.
echo # Resolve links: $0 may be a link
echo app_path=$0
echo.
echo # Need this for daisy-chained symlinks.
echo while
echo     APP_HOME=${app_path%%"${app_path##*/}"}  # leaves a trailing /; empty if no leading path
echo     [ -h "$app_path" ]
echo do
echo     ls=$( ls -ld "$app_path" ^)
echo     link=${ls#*' -^> '}
echo     case $link in             #^(
echo       /*^) app_path=$link ;; #^(
echo       *^) app_path=$APP_HOME$link ;;
echo     esac
echo done
echo.
echo # This is normally unused
echo # shellcheck disable=SC2034
echo APP_BASE_NAME=${0##*/}
echo # Discard cd standard output in case $CDPATH is set ^(https://github.com/gradle/gradle/issues/25036^)
echo APP_HOME=$( cd "${APP_HOME:-./}" ^&^& pwd -P ^) ^|^| exit
echo.
echo # Use the maximum available, or set MAX_FD != -1 to use that value.
echo MAX_FD=maximum
echo.
echo warn ^( ^) {
echo     echo "$*"
echo } ^>^&2
echo.
echo die ^( ^) {
echo     echo
echo     echo "$*"
echo     echo
echo     exit 1
echo } ^>^&2
echo.
echo # OS specific support ^(must be 'true' or 'false'^).
echo cygwin=false
echo msys=false
echo darwin=false
echo nonstop=false
echo case "$( uname ^)" in                #^(
echo   CYGWIN* ^)         cygwin=true  ;; #^(
echo   Darwin* ^)         darwin=true  ;; #^(
echo   MSYS* ^| MINGW* ^)  msys=true    ;; #^(
echo   NONSTOP* ^)        nonstop=true ;;
echo esac
echo.
echo CLASSPATH=$APP_HOME/gradle/wrapper/gradle-wrapper.jar
echo.
echo.
echo # Determine the Java command to use to start the JVM.
echo if [ -n "$JAVA_HOME" ] ; then
echo     if [ -x "$JAVA_HOME/jre/sh/java" ] ; then
echo         # IBM's JDK on AIX uses strange locations for the executables
echo         JAVACMD=$JAVA_HOME/jre/sh/java
echo     else
echo         JAVACMD=$JAVA_HOME/bin/java
echo     fi
echo     if [ ! -x "$JAVACMD" ] ; then
echo         die "ERROR: JAVA_HOME is set to an invalid directory: $JAVA_HOME
echo.
echo Please set the JAVA_HOME variable in your environment to match the
echo location of your Java installation."
echo     fi
echo else
echo     JAVACMD=java
echo     if ! command -v java ^>/dev/null 2^>^&1
echo     then
echo         die "ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
echo.
echo Please set the JAVA_HOME variable in your environment to match the
echo location of your Java installation."
echo     fi
echo fi
echo.
echo # Increase the maximum file descriptors if we can.
echo if ! "$cygwin" ^&^& ! "$darwin" ^&^& ! "$nonstop" ; then
echo     case $MAX_FD in #^(
echo       max*^)
echo         # In POSIX sh, ulimit -H is undefined. That's why the result is checked to see if it worked.
echo         # shellcheck disable=SC2039,SC3045
echo         MAX_FD=$( ulimit -H -n ^) ^|^|
echo             warn "Could not query maximum file descriptor limit"
echo     esac
echo     case $MAX_FD in  #^(
echo       '' ^| soft^) :;; #^(
echo       *^)
echo         # In POSIX sh, ulimit -n is undefined. That's why the result is checked to see if it worked.
echo         # shellcheck disable=SC2039,SC3045
echo         ulimit -n "$MAX_FD" ^|^|
echo             warn "Could not set maximum file descriptor limit: $MAX_FD"
echo     esac
echo fi
echo.
echo # Collect all arguments for the java command, stacking in reverse order:
echo #   * args from the command line
echo #   * the main class name
echo #   * -classpath
echo #   * -D...appname settings
echo #   * --module-path ^(only if needed^)
echo #   * DEFAULT_JVM_OPTS, JAVA_OPTS, and GRADLE_OPTS environment variables.
echo.
echo # For Cygwin or MSYS, switch paths to Windows format before running java
echo if "$cygwin" ^|^| "$msys" ; then
echo     APP_HOME=$( cygpath --path --mixed "$APP_HOME" ^)
echo     CLASSPATH=$( cygpath --path --mixed "$CLASSPATH" ^)
echo.
echo     JAVACMD=$( cygpath --unix "$JAVACMD" ^)
echo.
echo     # Now convert the arguments - kludge to limit ourselves to /bin/sh
echo     for arg do
echo         if
echo             case $arg in                                #^(
echo               -D* ^| -Xmx* ^| -Xms* ^| -Xx* ^) ;; # Allow the user to specify the options.
echo               *^)
echo                 echo "$arg" ^| grep -Eq -- '^(^|[[:space:]]^)-D[^[:space:]]+=[^[:space:]]+' ^|^|
echo                 echo "$arg" ^| grep -Eq -- '^(^|[[:space:]]^)-Xm[sx][[:digit:].]+[KMGTPE]?[[:space:]]*$' ^|^|
echo                 echo "$arg" ^| grep -Eq -- '^(^|[[:space:]]^)-Xx[^[:space:]]+$'
echo             esac
echo         then
echo             eval "set -- \"$@\" \"$arg\""
echo         fi
echo     done
echo else
echo     eval "set -- \"$@\" \"$arg\""
echo fi
echo.
echo.
echo # Add default JVM options here. You can also use JAVA_OPTS and GRADLE_OPTS to pass JVM options to this script.
echo DEFAULT_JVM_OPTS='"-Xmx64m" "-Xms64m"'
echo.
echo # Collect all arguments for the java command:
echo #   * DEFAULT_JVM_OPTS, JAVA_OPTS, JAVA_OPTS, and optsEnvironmentVar are not allowed to contain shell fragments,
echo #     and any embedded shellness will be escaped.
echo #   * For example: A user cannot expect ${Hostname} to be expanded, as it is an environment variable and will be
echo #     treated as '${Hostname}' itself on the command line.
echo.
echo set -- \
echo         "-Dorg.gradle.appname=$APP_BASE_NAME" \
echo         -classpath "$CLASSPATH" \
echo         org.gradle.wrapper.GradleWrapperMain \
echo         "$@"
echo.
echo # Stop when "xargs" is not available.
echo if ! command -v xargs ^>/dev/null 2^>^&1
echo then
echo     die "xargs is not available"
echo fi
echo.
echo # Use "xargs" to parse quoted args.
echo #
echo # With -n1 it outputs one arg per line, with the quotes and backslashes removed.
echo #
echo # In Bash we could simply go:
echo #
echo #   readarray ARGS ^< ^<^( xargs -n1 ^<^<^<"$var" ^) ^&^&
echo #   set -- "${ARGS[@]}" "$@"
echo #
echo # but POSIX shell has neither arrays nor command substitution, so instead we
echo # post-process each arg ^(as a line of input to sed^) to backslash-escape any
echo # character that might be a shell metacharacter, then use eval to reverse
echo # that process ^(while maintaining the separation between arguments^), and wrap
echo # the whole thing up as a single "set" statement.
echo #
echo # This will of course break if any of these variables contains a newline or
echo # an unmatched quote.
echo #
echo.
echo eval "set -- $(
echo         printf '%%s\n' "$DEFAULT_JVM_OPTS $JAVA_OPTS $GRADLE_OPTS" ^|
echo         xargs -n1 ^|
echo         sed ' s~[\\$`"]~\\^&~g; s~$~"~; s~^^~"~; s~$~\\n~' ^|
echo         tr -d '\n'
echo     ^)" '"$@"'
echo.
echo exec "$JAVACMD" "$@"
) > "android\gradlew"

:: Download gradle-wrapper.jar
echo.
echo Step 3: Downloading gradle-wrapper.jar...
echo ----------------------------------------

:: Create a simple downloader script
(
echo $url = "https://github.com/gradle/gradle/raw/v8.10.2/gradle/wrapper/gradle-wrapper.jar"
echo $output = "android\gradle\wrapper\gradle-wrapper.jar"
echo.
echo try {
echo     $ProgressPreference = 'SilentlyContinue'
echo     Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing
echo     Write-Host "Successfully downloaded gradle-wrapper.jar"
echo } catch {
echo     Write-Host "Failed to download gradle-wrapper.jar: $_"
echo     exit 1
echo }
) > download-wrapper.ps1

powershell -ExecutionPolicy Bypass -File download-wrapper.ps1
del download-wrapper.ps1

echo.
echo Step 4: Creating correct settings.gradle for RN 0.80.x...
echo --------------------------------------------------------

:: Create the correct settings.gradle
(
echo pluginManagement {
echo     includeBuild^("../node_modules/@react-native/gradle-plugin"^)
echo     repositories {
echo         google^(^)
echo         mavenCentral^(^)
echo         gradlePluginPortal^(^)
echo     }
echo }
echo.
echo plugins {
echo     id^("com.facebook.react.settings"^)
echo }
echo.
echo extensions.configure^(com.facebook.react.ReactSettingsExtension^) { ex -^>
echo     if ^(System.getenv^("REACT_NATIVE_ARCHITECTURES"^) != null^) {
echo         ex.architectures.set^(System.getenv^("REACT_NATIVE_ARCHITECTURES"^).split^(","^)^)
echo     }
echo }
echo.
echo rootProject.name = 'BrainBites'
echo include ':app'
) > "android\settings.gradle"

echo.
echo Step 5: Verifying local.properties...
echo -------------------------------------

if not exist "android\local.properties" (
    (
    echo sdk.dir=C:\\Users\\nihit\\AppData\\Local\\Android\\Sdk
    ) > "android\local.properties"
    echo Created local.properties
) else (
    echo local.properties already exists
)

echo.
echo Step 6: Setting permissions and testing...
echo -----------------------------------------

cd "%ROOT_DIR%\android"

:: Make files executable
attrib -r gradlew.bat 2>nul
attrib -r gradlew 2>nul

:: Test gradle wrapper
echo Testing Gradle wrapper...
call gradlew.bat --version

if errorlevel 1 (
    echo.
    echo ERROR: Gradle wrapper test failed!
    echo Please check Java installation and JAVA_HOME
) else (
    echo.
    echo Gradle wrapper working! Now trying clean...
    call gradlew.bat clean --refresh-dependencies --no-daemon
    
    if errorlevel 1 (
        echo.
        echo Clean failed. Trying one more time with full refresh...
        call gradlew.bat --stop
        timeout /t 2 /nobreak >nul
        call gradlew.bat clean --refresh-dependencies --rerun-tasks --no-build-cache
    )
)

cd "%ROOT_DIR%"

echo.
echo ================================================
echo Fix process completed!
echo ================================================
echo.
echo What we did:
echo - Cleared ALL Gradle caches ^(including corrupted metadata^)
echo - Created fresh Gradle wrapper files
echo - Downloaded gradle-wrapper.jar
echo - Created correct settings.gradle for RN 0.80.x
echo - Set up local.properties
echo.
echo Next steps:
echo 1. Close this terminal and open a new one
echo 2. cd android
echo 3. gradlew clean
echo 4. gradlew assembleDebug
echo.
echo If still having issues, try:
echo - Delete C:\Users\nihit\.gradle folder completely
echo - Run: npx react-native doctor
echo - Ensure you have all Android SDK components installed
echo.
pause