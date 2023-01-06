[![Build Status](https://travis-ci.org/unigrid-project/janus-cypherium.svg?branch=main)](https://travis-ci.org/unigrid-project/janus-cypherium)

# WARNING
Because of server-side changes, the wallet has issues with sending transactions - see https://github.com/unigrid-project/janus-cypherium/issues/1 for more information. For now, use the mobile wallet to send transactions by importing your mnemonic seed into it.

<p align="center">
  <br><br>
  <a href="https://www.cypherium.io/"><img alt="cypherium" src="https://www.cypherium.io/wp-content/uploads/2020/07/Cypherium-Logo.png" width="500"/></a>
  <br><sup>The Janus-Cypherium wallet built by the <a href="https://unigrid.org">UNIGRID organization</a></sup><br>
</p>



Running
-------
To run a local copy in dev mode.
```
cd wallet/
yarn
yarn dev
```

Building
--------
To build for your platform you can run the following commands. The output will be placed inside `wallet/dist`
```
cd wallet/
yarn
yarn dist
```

About UNIGRID
-------------
For more information, as well as an immediately useable, binary version of the UNIGRID sofware, see https://unigrid.org.

About Cypherium
---------------
An enterprise ready blockchain. For more info please see https://www.cypherium.io/

License
-------
The Janus-Cypherium wallet is released under the terms of the MIT license. See [COPYING](COPYING) for more information or see http://opensource.org/licenses/MIT.

Development process
-------------------
Developers work in their own trees, then submit pull requests when they think their feature or bug fix is ready.

The patch will be accepted if there is broad consensus that it is a good thing. Developers should expect to rework and resubmit patches if the code doesn't match the project's coding conventions or are controversial.

The `master` branch is regularly built and tested, but is not guaranteed to be completely stable. [Tags](https://github.com/unigrid-project/janus-cypherium/tags) are created regularly to indicate new official, stable release versions of Janus-Cypherium.

Automated Testing
-----------------
Developers are strongly encouraged to write unit tests for new code, and to submit new unit tests for old code.

Support the project
-------------------
If you use the wallet and enjoy it and or find it useful please consider donating. We're fully supported by donations only and the wallet is free to use without any hidden costs. Donations help us continue with support and development.
```
CPH CPH791DCFC7B65EE9B77F6074577B1D0CC33219A74A
UGD H7bEB2nv8PADro1iLmdrCBRH7GwP4anUXi
```
