
Debian
====================
This directory contains files used to package unigridd/unigrid-qt
for Debian-based Linux systems. If you compile unigridd/unigrid-qt yourself, there are some useful files here.

## unigrid: URI support ##


unigrid-qt.desktop  (Gnome / Open Desktop)
To install:

	sudo desktop-file-install unigrid-qt.desktop
	sudo update-desktop-database

If you build yourself, you will either need to modify the paths in
the .desktop file or copy or symlink your unigridqt binary to `/usr/bin`
and the `../../share/pixmaps/unigrid128.png` to `/usr/share/pixmaps`

unigrid-qt.protocol (KDE)

