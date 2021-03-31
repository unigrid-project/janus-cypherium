[![Build Status](https://travis-ci.org/unigrid-project/janus.svg?branch=master)](https://travis-ci.org/unigrid-project/janus)

The Janus-Cypherium wallet built by the UNIGRID organization
==================================
<p align="center">
  <a href="https://www.cypherium.io/"><img alt="cypherium" src="https://www.cypherium.io/wp-content/uploads/2020/07/Cypherium-Logo.png" width="500"/></a>
</p>

================================== 

Build
-----
To run a local copy in dev mode.
`cd wallet/`
`yarn`
`yarn dev`

Publishing
----------

In order to publish new builds to github that will work with electron-updater you need to generate a git key.

Generate a GitHub access token by going to <https://github.com/settings/tokens/new>.  The access token should have the `repo` scope/permission.  Once you have the token, assign it to an environment variable
    
    On macOS/linux:

        export GH_TOKEN="<YOUR_TOKEN_HERE>"

    On Windows, run in powershell:

        [Environment]::SetEnvironmentVariable("GH_TOKEN","<YOUR_TOKEN_HERE>","User")

    Make sure to restart IDE/Terminal to inherit latest env variable.

Publish for your platform with:

`cd wallet/`
`yarn dist -p always`

This will also upload the build to git if you have properly added your TOKEN.

==================================

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

The `master` branch is regularly built and tested, but is not guaranteed to be completely stable. [Tags](https://github.com/unigrid-project/janus/tags) are created regularly to indicate new official, stable release versions of UNIGRID.

Automated Testing
-----------------
Developers are strongly encouraged to write unit tests for new code, and to submit new unit tests for old code.

