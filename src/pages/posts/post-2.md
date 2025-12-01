---
layout: ../../layouts/BlogLayout.astro
title: 'Cloud-HypervisorのAPI経由でブートできない問題'
pubDate: "2025-12-02"
description: '投げるJSONの形式がドキュメントと違う'
author: 'mikio'
tags: ["Cloud-Hypervisor"]
---

[EC2-Proto](https://github.com/mikio815/ec2-proto)

## Cloud-Hypervisorを使ってVMを作成したい

EC2を作りたいと思い、VMの管理にgoogleが提供しているOSSであるCloud-Hypervisor(CH)を使っています。  
CHを使ってブートするためには

- CLIでワンライナーでブートする
- CH側に用意されているAPIを叩く

という２種類の方法があり、後者であるAPI経由でのブートで手間取ったので備忘録です。

## ドキュメントを読む

[ドキュメント](https://intelkevinputnam.github.io/cloud-hypervisor-docs-HTML/docs/api.html)が古く(？)、vm_createを叩く際にこれに記載されているJSONの形式でリクエストを送ると`No bootitem provided:`というエラーが出ます。

### VMを作成する(できない)

```sh
./cloud-hypervisor --api-socket /tmp/cloud-hypervisor.sock
```

```sh
curl --unix-socket /tmp/cloud-hypervisor.sock -i \ 
    -X PUT 'http://localhost/api/v1/vm.create' \ 
    -H 'Accept: application/json' \ 
    -H 'Content-Type: application/json' \ 
    -d '{ 
        "cpus": { "boot_vcpus": 1, "max_vcpus": 1 }, 
        "kernel": { "path": "./images/CLOUDHV.fd" }, 
        "cmdline": { "args": "console=ttyS0 console=hvc0 root=/dev/vda1 rw" }, 
        "disks": [ { "path": "./images/noble.raw" } ], 
        "rng": { "src": "/dev/urandom" } }' 
```

&nbsp;  
この時点で500が返ってきている

```sh
HTTP/1.1 500 
Server: Cloud Hypervisor API 
Connection: keep-alive 
Content-Type: application/json 
Content-Length: 72 
```

### ブートする(できない)

```sh
curl --unix-socket /tmp/cloud-hypervisor.sock -i 
    -X PUT 'http://localhost/api/v1/vm.boot' 
```

&nbsp;  
失敗！

```sh
HTTP/1.1 500 
Server: Cloud Hypervisor API 
Connection: keep-alive 
Content-Type: application/json 
Content-Length: 162 

["Error from API","The VM could not boot","Failed to validate config","Payload configuration is not bootable","No bootitem provided: neither firmware nor kernel"]
```

## 解決

vm_createの際にkernelの指定を"payload"で囲って、かつパスはオブジェクトとしてはなくstringで渡す必要がある。

```sh
curl --unix-socket /tmp/cloud-hypervisor.sock -i \ 
    -X PUT 'http://localhost/api/v1/vm.create' \ 
    -H 'Accept: application/json' \ 
    -H 'Content-Type: application/json' \ 
    -d '{ 
        "cpus": { "boot_vcpus": 1, "max_vcpus": 1 }, 
        "payload": { 
            "kernel": "./images/CLOUDHV.fd", 
            "cmdline": "console=ttyS0 console=hvc0 root=/dev/vda1 rw"
        },
        "disks": [ { "path": "./images/noble.raw" } ], 
        "rng": { "src": "/dev/urandom" } }' 
```

&nbsp;  
vm_bootについては変更する必要はありません。

## 余談

### なぜpayload{}で囲う必要があるか？

ドキュメントは無視して、[CHのOpenAPI仕様](https://github.com/cloud-hypervisor/cloud-hypervisor/blob/main/vmm/src/api/openapi/cloud-hypervisor.yaml)を読むと

```yaml
  /vm.create:
    put:
      summary: Create the cloud-hypervisor Virtual Machine (VM) instance. The instance is not booted, only created.
      operationId: createVM
      requestBody:
        description: The VM configuration
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/VmConfig"
        required: true
      responses:
        204:
          description: The VM instance was successfully created.
```

```yaml
    PayloadConfig:
      type: object
      properties:
        firmware:
          type: string
        kernel:
          type: string
        cmdline:
          type: string
        initramfs:
          type: string
        igvm:
          type: string
        host_data:
          type: string
      description: Payloads to boot in guest

    VmConfig:
      required:
        - payload
      type: object
      properties:
        cpus:
          $ref: "#/components/schemas/CpusConfig"
        memory:
          $ref: "#/components/schemas/MemoryConfig"
        payload:
          $ref: "#/components/schemas/PayloadConfig"
        rate_limit_groups:
          type: array
          items:
            $ref: "#/components/schemas/RateLimitGroupConfig"
        disks:
          type: array
          items:
            $ref: "#/components/schemas/DiskConfig"
        net:
          type: array
          items:
            $ref: "#/components/schemas/NetConfig"
        rng:
          $ref: "#/components/schemas/RngConfig"
        balloon:
          $ref: "#/components/schemas/BalloonConfig"
        fs:
          type: array
          items:
            $ref: "#/components/schemas/FsConfig"
        pmem:
          type: array
          items:
            $ref: "#/components/schemas/PmemConfig"
        serial:
          $ref: "#/components/schemas/ConsoleConfig"
        console:
          $ref: "#/components/schemas/ConsoleConfig"
        debug_console:
          $ref: "#/components/schemas/DebugConsoleConfig"
        devices:
          type: array
          items:
            $ref: "#/components/schemas/DeviceConfig"
        vdpa:
          type: array
          items:
            $ref: "#/components/schemas/VdpaConfig"
        vsock:
          $ref: "#/components/schemas/VsockConfig"
        numa:
          type: array
          items:
            $ref: "#/components/schemas/NumaConfig"
        iommu:
          type: boolean
          default: false
        watchdog:
          type: boolean
          default: false
        pvpanic:
          type: boolean
          default: false
        pci_segments:
          type: array
          items:
            $ref: "#/components/schemas/PciSegmentConfig"
        platform:
          $ref: "#/components/schemas/PlatformConfig"
        tpm:
          $ref: "#/components/schemas/TpmConfig"
        landlock_enable:
          type: boolean
          default: false
        landlock_rules:
          type: array
          items:
            $ref: "#/components/schemas/LandlockConfig"
      description: Virtual machine configuration
```

&nbsp;  
と書いてあった。

なお、APIではなくCLI経由で作成する場合は単純に`--kernel`オプションをつけて作成するだけでブートできます。

ちゃんとAPIの仕様書は読んだほうがいいなと思いました。

&nbsp;  
以上
