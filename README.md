The UNIGRID main wallet and daemon
==================================
<p align="center">
  <a href="https://www.unigrid.org"><img alt="UNIGRID - Sharded Internet" src="https://www.unigrid.org/assets/img/unigrid14.png" width="500"/></a>
</p>

==================================
This is an Alpha release at the current stage.

Building of the daemon is the standard process of following the docs by compiling static files inside depends/

Then following the instructions in docs/ for your specific platform.

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

##About UNIGRID

The original Internet was envisioned to become an open and distributed network that was scalable and fair, allowing access to data and services without surveillance or security concerns. However, in recent years, the network has become increasingly centralized and controlled by big businesses running huge data centers. This centralization has given big entities and businesses unprecedented control of the traffic and data of the network.

As a remedy to this deteriorating trend, we suggest the inception of a decentralized and consensus-driven segmented blockchain network based on a striped storage solution. The protocol allows for a completely decentralized and secure blockchain-based Internet where anybody, including private persons, can host an income-generating service node, aiding the network with compute cycles, bandwidth and storage space. To allow for complete utilization of the network, an access layer is provided, allowing for the development of protocols, services and infrastructure.

UNIGRID the digital currency and main block chain that supports the previously mentioned network, enablng instant payments to anyone, anywhere in the world. UNIGRID uses peer-to-peer technology to operate with no central authority: managing transactions and issuing money are carried out collectively by the network. UNIGRID is the name of open source software which enables the use of this currency.

For more information, as well as an immediately useable, binary version of the UNIGRID sofware, see https://unigrid.org.

License
-------
The UNIGRID daemon and wallet are released under the terms of the MIT license. See [COPYING](COPYING) for more information or see http://opensource.org/licenses/MIT.

Development process
-------------------
Developers work in their own trees, then submit pull requests when they think their feature or bug fix is ready.

The patch will be accepted if there is broad consensus that it is a good thing. Developers should expect to rework and resubmit patches if the code doesn't match the project's coding conventions (see [doc/coding.md](doc/coding.md)) or are controversial.

The `master` branch is regularly built and tested, but is not guaranteed to be completely stable. [Tags](https://github.com/unigrid-project/UNIGRID/tags) are created regularly to indicate new official, stable release versions of UNIGRID.

Automated Testing
-----------------
Developers are strongly encouraged to write unit tests for new code, and to submit new unit tests for old code. Unit tests can be compiled and run (assuming they weren't disabled in configure) with: `make check`.

