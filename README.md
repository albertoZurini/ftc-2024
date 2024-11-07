# $GREEN: Soroban Community Currencies
Soroban Community Currencies is an initiative to bring community-driven, trustless currencies to the Soroban blockchain, inspired by the innovative work of [Grassroots Economics](https://www.grassrootseconomics.org). Our goal is to empower communities to create, manage, and transact with their own currency systems with ease, leveraging the security and transparency of blockchain technology while maintaining a user-friendly experience that abstracts away all blockchain components from the user.

# Project Overview
Our project enables community members to mint and burn their own tokens using a Primary Automated Market Maker (PAMM) Bonding Curve. With this mechanism, users gain a trusted, algorithmic approach to manage community funds with built-in backing via a bonding curve. This bonding cirve generates fees when minting and burning, which go to a common pool that the community can then allocate to maximise their collective goals. We follow the bonding curve specifications from the BCRG (as per [conding](https://github.com/bonding-curves/conding)) and the [Governance Modules Library by Blockscience](https://medium.com/block-science/launching-an-open-source-library-for-governance-modules-on-soroban-276fc19f966f).

# Key Features
- **Trustless Minting and Burning:** Community members can independently mint and burn tokens, benefiting from the automatic pricing provided by the PAMM bonding curve.
- **Common Pool:** Upon minting and burning tokens, some of the funds are moved to a common pool, for which the community then decides how to allocate to meet their goals. 
- **Simple and User-Friendly Interface:** An intuitive UI ensures seamless token transfers within the community.
- **Peer-to-Peer NFC Payments:** Utilizing NFC technology, members can make secure, direct payments without intermediaries, harnessing the speed and reliability of the Stellar network.
- **In-App Wallet Management: (WIP)** The app fully manages wallet functions, allowing users to interact with community tokens without needing in-depth knowledge of blockchain or crypto.
- **One-Click Onboarding and Offboarding: (WIP)** Simplified token minting and burning for streamlined access and exits.
This system serves as a foundational step for communities looking to manage their resources independently and transparently.

# What is a PAMM?
A Primary Issuance Automated Market Maker (PAMM) is a decentralized mechanism that allows communities to issue their own tokens backed by an underlying bonding curve. This ensures token prices are algorithmically determined based on supply and demand, providing intrinsic value and liquidity to the community currency. Read more here: [https://mirror.xyz/0x8fF6Fe58b468B1F18d2C54e2B0870b4e847C730d/1Pxl_fbIPifIQ4_y0xoJGZGEk70qfOM3Gi9nWycm-8k](https://mirror.xyz/0x8fF6Fe58b468B1F18d2C54e2B0870b4e847C730d/1Pxl_fbIPifIQ4_y0xoJGZGEk70qfOM3Gi9nWycm-8k).

# Project Structure
The repository contains three main components, each essential to the overall functionality of Community Soroban Currencies:

1. Android-app
A mobile application designed for seamless interaction with the community currency. This app manages wallet functions, handles token transfers, supports peerless NFC payments, and provides an easy-to-understand interface for users unfamiliar with blockchain technology.

2. blockademy
An educational platform embedded in the project to onboard users into the system. It offers resources, guides, and training materials on managing community currencies and using the app effectively.

3. contracts
The core smart contracts that implement the bonding curve and PAMM mechanisms on Soroban. These contracts facilitate trustless token issuance, burning, and pricing adjustments based on the bonding curve model, enabling a secure and transparent currency system.

# Future Development
We aim to expand Community Soroban Currencies with additional features and refinements to enhance usability, security, and scalability. By leveraging grant support, we will continue to innovate, bringing more functionalities to the platform.

# Getting Started
For installation and setup instructions for each component, please visit the respective directories:

Android-app
blockademy
contracts

Feel free to contribute, raise issues, and share ideas for improvement. Together, we can build a robust, community-focused financial ecosystem on Soroban.