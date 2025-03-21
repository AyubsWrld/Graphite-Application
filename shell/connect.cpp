#include <iostream>
#include <thread>

int main() {
    std::cout << "CPU Cores: " << std::thread::hardware_concurrency() << std::endl;
    return 0;
}
