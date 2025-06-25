// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// dialogManager.js

import Swal from 'sweetalert2';
import { CoreManager } from './coreManager';

export class DialogManager extends CoreManager {
    
    constructor(instance) {
        super(instance);
    }

    openOffline = (diff, maxLoop, skippedLoop) => {
        Swal.fire({
            title: 'Offline loop!',
            html: '<div class="generic-core-panel">'
                    + '<span class="generic-field label generic-text">' + '<b>Offline</b> for ' + diff + 'ms' + '</span>'
                    + '<span class="generic-field label generic-text">' + 'Looping ' + maxLoop + ' times' + '</span>'
                    + '<span class="generic-field label generic-text">' + 'Skipped ' + skippedLoop + ' actions' + '</span>'
                    + '<span class="generic-field label generic-text">' + '<b>Executed</b> ' + (maxLoop - skippedLoop) + ' actions' + '</span>'
                + '</div>',
            icon: 'success',
            confirmButtonText: 'OK'
        });
    }
}