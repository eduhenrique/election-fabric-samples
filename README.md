[//]: # (SPDX-License-Identifier: CC-BY-4.0)

# First Step - By EduHenrique
Follow the [Install the Fabric Samples, Binaries, and Docker Images - v2.1.0](https://hyperledger-fabric.readthedocs.io/en/release-2.1/install.html). In this Fork, an election process is added using the Docker images from Fabric 2.1.0 version.

You should have the [Prerequisites](https://hyperledger-fabric.readthedocs.io/en/release-2.1/prereqs.html) configured in your machine.

After running the **curl -sSL https://bit.ly/2ysbOFE | bash -s** part from the above link, the bin and **config** folders will be created, then you should copy those folders to this fork one. 

- **Added Electoral example, where you can find more info of setup and running**
    - [Client](electoral_process)
    - [Chaincode](chaincode/electoral_process/typescript)

**the next snippet is the original Readme. All the documentation links point to the version 2.1 of the Hyperledger.**

# Hyperledger Fabric Samples

You can use Fabric samples to get started working with Hyperledger Fabric, explore important Fabric features, and learn how to build applications that can interact with blockchain networks using the Fabric SDKs. To learn more about Hyperledger Fabric, visit the [Fabric documentation](https://hyperledger-fabric.readthedocs.io/en/release-2.1).

## Getting started with the Fabric samples

To use the Fabric samples, you need to download the Fabric Docker images and the Fabric CLI tools. First, make sure that you have installed all of the [Fabric prerequisites](https://hyperledger-fabric.readthedocs.io/en/release-2.1/prereqs.html). You can then follow the instructions to [Install the Fabric Samples, Binaries, and Docker Images](https://hyperledger-fabric.readthedocs.io/en/release-2.1/install.html) in the Fabric documentation. In addition to downloading the Fabric images and tool binaries, the instructions will make you clone the Fabric samples on your local machine.

## Guide to the Fabric samples

You can use the following table to learn more about each sample, and find the corresponding tutorial or documentation.

|  **Sample** | **Description** | **Documentation** |
| -------------|------------------------------|------------------|
| [Fabric test network](test-network) | Get started by deploying a basic Fabric network on your local machine. | [Using the Fabric test network](https://hyperledger-fabric.readthedocs.io/en/release-2.1/test_network.html) |
| [Fabcar](fabcar) | Learn how to use the Fabric SDK's to invoke smart contracts from your client applications. | [Writing your first application](https://hyperledger-fabric.readthedocs.io/en/release-2.1/write_first_app.html) |
| [Commercial paper](commercial-paper) | Explore a use case in which two organizations use a blockchain network to trade commercial paper. | [Commercial paper tutorial](https://hyperledger-fabric.readthedocs.io/en/release-2.1/tutorial/commercial_paper.html) |
| [Interest rate swaps](interest_rate_swaps) | Explore state based endorsement using a financial services use case. | [Setting Key level endorsement policies](https://hyperledger-fabric.readthedocs.io/en/release-2.1/endorsement-policies.html#setting-key-level-endorsement-policies) |
| [Off chain data](off_chain_data) | Learn how to use the Peer channel-based event services to build an off chain database for reporting and analytics. | [Peer channel-based event services](https://hyperledger-fabric.readthedocs.io/en/release-2.1/peer_event_services.html) |
| [High throughput](high-throughput) | Learn how you can design your smart contracts to process a large volume of transactions. | |
| [First network](first-network) | **Deprecated. Use the Fabric test network to get started.** | [Build your first network](https://hyperledger-fabric.readthedocs.io/en/release-2.1/build_network.html) |
| [Chaincode](chaincode) | A set of sample smart contracts used by other samples and the tutorials in the Fabric documentation. | [Fabric tutorials](https://hyperledger-fabric.readthedocs.io/en/release-2.1/tutorials.html) |

## License <a name="license"></a>

Hyperledger Project source code files are made available under the Apache
License, Version 2.0 (Apache-2.0), located in the [LICENSE](LICENSE) file.
Hyperledger Project documentation files are made available under the Creative
Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.
