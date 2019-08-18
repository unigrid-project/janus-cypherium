#!/bin/sh
if [ $# -gt 1 ]; then
    cd "$2"
fi
if [ $# -gt 0 ]; then
    FILE="$1"
    shift
    if [ -f "$FILE" ]; then
        INFO="$(head -n 1 "$FILE")"
    fi
else
    echo "Usage: $0 <filename> <srcroot>"
    exit 1
fi

DESC=""
SUFFIX=""
TIME=""

if [ -e "$(which git 2>/dev/null)" -a "$(git rev-parse --is-inside-work-tree 2>/dev/null)" = "true" ]; then
    # clean 'dirty' status of touched files that haven't been modified
    git diff >/dev/null 2>/dev/null

    # get a string like "v0.6.0-66-g59887e8-dirty"
    DESC="$(git describe --tags --long --abbrev=5 2>/dev/null)"
    DESC=${DESC%???????}
    DESC=$(echo $DESC | tr - .)

    # get a string like "2012-04-10 16:27:19 +0200"
    TIME="$(git log -n 1 --format="%ci")"
fi

if [ -n "$DESC" ]; then
    NEWINFO="#define BUILD_DESC \"$DESC\""
elif [ -n "$SUFFIX" ]; then
    NEWINFO="#define BUILD_SUFFIX $SUFFIX"
else
    NEWINFO="// No build information available"
fi

# only update build.h if necessary
if [ "$INFO" != "$NEWINFO" ]; then
    echo "$NEWINFO" >"$FILE"
    if [ -n "$TIME" ]; then
        echo "#define BUILD_DATE \"$TIME\"" >> "$FILE"
    fi
fi
