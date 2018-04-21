
from __future__ import print_function
from web3 import Web3, KeepAliveRPCProvider, IPCProvider
import argparse,subprocess,sys


found_depend = False
try:
    import z3
except:
    print("\033[91m[-] Python module z3 is missing.\033[0m Please install it (check https://github.com/Z3Prover/z3)")
    found_depend = True
try:
    import web3
except:
    print("\033[91m[-] Python module web3 is missing.\033[0m Please install it (pip install web3).")
    found_depend = True


if not (subprocess.call("type geth", shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE) == 0):
    print("\033[91m[-] Go Ethereum is missing.\033[0m Please install it (check https://ethereum.github.io/go-ethereum/install/) and make sure geth is in the path.")
    found_depend = True

if found_depend:
    sys.exit(1)



import check_suicide 
import check_leak 
import check_lock
from values import MyGlobals
from blockchain import *
from contracts import *


global debug, max_calldepth_in_normal_search, read_from_blockchain, checktype


def main(args):


    parser = argparse.ArgumentParser()
    parser.add_argument("-i","--inputFile",        type=str,   help="contracts file", action='store')
    parser.add_argument("-f","--bytecodeFolder", type=str,   help="bytecode location forlder where filename == contract address ", action='store')
    parser.add_argument("-o","--outputFile",        type=str,   help="results file", action='store')
    parser.add_argument("--debug",        help="Print extended debug info ", action='store_true')
    parser.add_argument("--max_inv",        help="The maximal number of function invocations (default 3) ", action='store')
    parser.add_argument("--solve_timeout",        help="Z3 solver timeout in milliseconds (default 10000, i.e. 10 seconds)", action='store')

    args = parser.parse_args( args )


    if args.debug:          MyGlobals.debug = True
    if args.max_inv:        MyGlobals.max_calldepth_in_normal_search = int(args.max_inv)
    if args.solve_timeout:  MyGlobals.SOLVER_TIMEOUT = int(args.solve_timeout)


    kill_active_blockchain()
 
    inputFile = args.inputFile
    outputFile = args.outputFile

    if not os.path.isfile(inputFile):
        print('\033[91m[-] File %s does NOT exist\033[0m' % inputFile )
    bytecodeFolder = args.bytecodeFolder    

    with open(inputFile) as contractsFile:
       with open(outputFile, 'a+', 0) as outF:
          for line in contractsFile:
             data = line.split()
             contract = data[0].split(',')
             (suicidal, leak) =  checkContract(contract[0], bytecodeFolder)
             outF.write('%s %s %s\r\n' % (contract[0], suicidal, leak))

def  checkContract (address, bytecodeFolder):
    # read bytecode

    filepath_code = os.path.join(bytecodeFolder, address);

    if not os.path.isfile(filepath_code):  
         print('\033[91m[-] File %s does NOT exist\033[0m' % filepath_code )
         return

    with open(filepath_code,'r') as f: code = f.read(); f.close()
    code = code.replace('\n','').replace('\r','').replace(' ','')
    if code[0:2] == '0x': code = code[2:]
    
    ret_suicide = False
    ret_leak = False
 
    print('Cheking contract %s' % address)
    try:
       ret_suicide = check_suicide.check_one_contract_on_suicide(code, '', MyGlobals.debug, False, False)
       print('\t suicide:%s' % ret_suicide)
    except:
       e = sys.exc_info()[0]
       print('Contract %s failed suicide check: %s' % (address, e))
    
    #try:
    #   ret_leak = check_leak.check_one_contract_on_ether_leak(code, '', MyGlobals.debug, False, False)
    #   print('\t leak:%s' % ret_leak)
    #except:
    #   e = sys.exc_info()[0]
    #   print('Contract %s failed leak check: %s' % (address, e))

    return (ret_suicide, ret_leak)


if __name__ == '__main__':


    global exec_as_script 
    MyGlobals.exec_as_script = True
    import sys
    main(sys.argv[1:])
