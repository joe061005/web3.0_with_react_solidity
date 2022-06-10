// https://eth-rinkeby.alchemyapi.io/v2/SXn-LBrthon02rDyXcrv4Iig8bJZnOKg

require('@nomiclabs/hardhat-waffle')

module.exports = {
  solidity: '0.8.0',
  networks: {
    rinkeby: {
      url: '<alchemyApi Link>',
      accounts: ['<private key>']
    }
  }
}

// address: 0x211c5B0AeD6Cad453D8235a5eE2628a620a559Ef
