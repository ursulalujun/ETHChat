import MetaMaskOnboarding from '@metamask/onboarding'

const initialize = () => {
    console.log("success")
    //Basic Actions Section
    const onboardButton = document.getElementById('connectButton');
    const getAccountsButton = document.getElementById('getAccounts');
    const getAccountsResult = document.getElementById('getAccountsResult');

    //检测metamask是否已经安装
    const isMetaMaskInstalled = () => {
        const { ethereum } = window;
        return Boolean(ethereum && ethereum.isMetaMask);
    };
    
    //创建一个新的MetaMask onboarding object
    const onboarding = new MetaMaskOnboarding({ forwarderOrigin });

    //开始连接进程
    const onClickInstall = () => {
        onboardButton.innerText = '正在安装中';
        onboardButton.disabled = true;
        onboarding.startOnboarding();
    };
    const onClickConnect = async () => {
        try {
            // 打开metamask
            await ethereum.request({ method: 'eth_requestAccounts' });
        } catch (error) {
            console.error(error);
        }
    };

    //通过检测metamask是否已经安装来修改按钮的呈现
    const MetaMaskClientCheck = () => {
        if (!isMetaMaskInstalled()) {
            //如果metamask没有安装就让用户安装（改变按钮样式为安装）
            onboardButton.innerText = '立即安装metamask!';
            //当按钮被点击后就调用此函数
            onboardButton.onclick = onClickInstall;
            //按钮禁用
            onboardButton.disabled = false;
        } else {
            //如果用户已经安装了metamask就让用户连接（改变按钮样式为连接）
            onboardButton.innerText = '连接metamask';
            //When the button is clicked we call this function to connect the users MetaMask Wallet
            onboardButton.onclick = onClickConnect;
            //The button is now disabled
            onboardButton.disabled = false;
            }
    };


    //获取地址
    getAccountsButton.addEventListener('click', async () => {
        //eth_accounts返回地址列表
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        //选择第一个地址并呈现它
        getAccountsResult.innerHTML = accounts[0] || 'Not able to get accounts';
    });


    MetaMaskClientCheck();
};


window.addEventListener('DOMContentLoaded', initialize);